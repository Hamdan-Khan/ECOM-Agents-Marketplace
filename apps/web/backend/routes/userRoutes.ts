import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { pool } from "../server"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()

// Register a new user
router.post("/register", async (req, res) => {
  const { email, password } = req.body

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." })
  }

  try {
    // Check if user already exists
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "User already exists with this email." })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Insert user into database
    const result = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING user_id, email, role",
      [email, hashedPassword, "user"],
    )

    // Create token
    const token = jwt.sign({ userId: result.rows[0].user_id, email, role: "user" }, process.env.JWT_SECRET as string, {
      expiresIn: "24h",
    })

    // Create initial token balance for the user
    await pool.query("INSERT INTO tokens (user_id, balance) VALUES ($1, $2)", [result.rows[0].user_id, 0])

    res.status(201).json({
      message: "User registered successfully",
      user: {
        userId: result.rows[0].user_id,
        email: result.rows[0].email,
        role: result.rows[0].role,
      },
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error during registration." })
  }
})

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." })
  }

  try {
    // Check if user exists
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." })
    }

    const user = result.rows[0]

    // Check password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password." })
    }

    // Create token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" },
    )

    res.status(200).json({
      message: "Login successful",
      user: {
        userId: user.user_id,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error during login." })
  }
})

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId

    // Get user details
    const userResult = await pool.query("SELECT user_id, email, role, created_at FROM users WHERE user_id = $1", [
      userId,
    ])

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found." })
    }

    // Get token balance
    const tokenResult = await pool.query("SELECT balance FROM tokens WHERE user_id = $1", [userId])

    const tokenBalance = tokenResult.rows.length > 0 ? tokenResult.rows[0].balance : 0

    res.status(200).json({
      user: userResult.rows[0],
      tokenBalance,
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({ message: "Server error while fetching profile." })
  }
})

export default router
