import express from "express"
import { pool } from "../server"
import { authenticateToken, isAdmin } from "../middleware/auth"

const router = express.Router()

// Get all agents with optional filters
router.get("/", async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query

    let query = "SELECT * FROM ai_agents WHERE 1=1"
    const queryParams: any[] = []

    // Apply filters if provided
    if (category) {
      queryParams.push(category)
      query += ` AND category = $${queryParams.length}`
    }

    if (minPrice) {
      queryParams.push(minPrice)
      query += ` AND price >= $${queryParams.length}`
    }

    if (maxPrice) {
      queryParams.push(maxPrice)
      query += ` AND price <= $${queryParams.length}`
    }

    if (search) {
      queryParams.push(`%${search}%`)
      query += ` AND (name ILIKE $${queryParams.length} OR description ILIKE $${queryParams.length})`
    }

    // Add ordering
    query += " ORDER BY created_at DESC"

    const result = await pool.query(query, queryParams)
    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error fetching agents:", error)
    res.status(500).json({ message: "Server error while fetching agents." })
  }
})

// Get a specific agent by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      "SELECT a.*, u.email as developer_email FROM ai_agents a LEFT JOIN users u ON a.developer_id = u.user_id WHERE a.agent_id = $1",
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Agent not found." })
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error("Error fetching agent:", error)
    res.status(500).json({ message: "Server error while fetching agent details." })
  }
})

// Create a new agent (admin only)
router.post("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description, category, price, subscription_price, developer_id } = req.body

    // Validate required fields
    if (!name || !description || !category || !price) {
      return res.status(400).json({ message: "Name, description, category, and price are required." })
    }

    const result = await pool.query(
      "INSERT INTO ai_agents (name, description, category, price, subscription_price, developer_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, description, category, price, subscription_price, developer_id],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error creating agent:", error)
    res.status(500).json({ message: "Server error while creating agent." })
  }
})

// Update an agent (admin only)
router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, category, price, subscription_price } = req.body

    // Check if agent exists
    const checkResult = await pool.query("SELECT * FROM ai_agents WHERE agent_id = $1", [id])
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Agent not found." })
    }

    // Update agent
    const result = await pool.query(
      "UPDATE ai_agents SET name = $1, description = $2, category = $3, price = $4, subscription_price = $5, updated_at = CURRENT_TIMESTAMP WHERE agent_id = $6 RETURNING *",
      [name, description, category, price, subscription_price, id],
    )

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error("Error updating agent:", error)
    res.status(500).json({ message: "Server error while updating agent." })
  }
})

// Delete an agent (admin only)
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Check if agent exists
    const checkResult = await pool.query("SELECT * FROM ai_agents WHERE agent_id = $1", [id])
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Agent not found." })
    }

    // Delete agent
    await pool.query("DELETE FROM ai_agents WHERE agent_id = $1", [id])

    res.status(200).json({ message: "Agent deleted successfully." })
  } catch (error) {
    console.error("Error deleting agent:", error)
    res.status(500).json({ message: "Server error while deleting agent." })
  }
})

export default router
