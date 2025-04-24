import express from "express"
import { pool } from "../server"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()

// Get user's token balance
router.get("/balance", authenticateToken, async (req, res) => {
  const userId = (req as any).user.userId

  try {
    const result = await pool.query("SELECT balance FROM tokens WHERE user_id = $1", [userId])

    if (result.rows.length === 0) {
      // Create token record if it doesn't exist
      await pool.query("INSERT INTO tokens (user_id, balance) VALUES ($1, $2)", [userId, 0])

      return res.status(200).json({ balance: 0 })
    }

    res.status(200).json({ balance: result.rows[0].balance })
  } catch (error) {
    console.error("Error fetching token balance:", error)
    res.status(500).json({ message: "Server error while fetching token balance." })
  }
})

// Purchase tokens
router.post("/purchase", authenticateToken, async (req, res) => {
  const { tokens, price } = req.body
  const userId = (req as any).user.userId

  // Validate input
  if (!tokens || !price) {
    return res.status(400).json({ message: "Tokens and price are required." })
  }

  // Start a transaction
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    // Check if user has a token record
    const tokenResult = await client.query("SELECT * FROM tokens WHERE user_id = $1", [userId])

    if (tokenResult.rows.length === 0) {
      // Create token record if it doesn't exist
      await client.query("INSERT INTO tokens (user_id, balance) VALUES ($1, $2)", [userId, tokens])
    } else {
      // Update token balance
      await client.query(
        "UPDATE tokens SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2",
        [tokens, userId],
      )
    }

    // Create a record of the token purchase
    // In a real implementation, this would also handle payment processing
    await client.query(
      `INSERT INTO token_purchases (user_id, amount, tokens, status)
       VALUES ($1, $2, $3, $4)`,
      [userId, price, tokens, "completed"],
    )

    await client.query("COMMIT")

    res.status(200).json({
      message: "Tokens purchased successfully",
      tokens,
    })
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Token purchase error:", error)
    res.status(500).json({ message: "Server error during token purchase." })
  } finally {
    client.release()
  }
})

// Use tokens for a purchase
router.post("/use", authenticateToken, async (req, res) => {
  const { amount, orderId } = req.body
  const userId = (req as any).user.userId

  // Validate input
  if (!amount || !orderId) {
    return res.status(400).json({ message: "Amount and order ID are required." })
  }

  // Start a transaction
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    // Check if user has enough tokens
    const tokenResult = await client.query("SELECT balance FROM tokens WHERE user_id = $1", [userId])

    if (tokenResult.rows.length === 0 || tokenResult.rows[0].balance < amount) {
      throw new Error("Insufficient token balance")
    }

    // Deduct tokens
    await client.query("UPDATE tokens SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2", [
      amount,
      userId,
    ])

    // Create transaction record
    await client.query(
      `INSERT INTO transactions (order_id, amount, currency, status, gateway_response)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        orderId,
        amount,
        "USD",
        "success",
        JSON.stringify({
          method: "tokens",
          timestamp: new Date().toISOString(),
        }),
      ],
    )

    // Update order status
    await client.query("UPDATE orders SET status = $1 WHERE order_id = $2", ["completed", orderId])

    // Record token usage
    await client.query(
      `INSERT INTO token_usage (user_id, tokens_used, order_id, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [userId, amount, orderId],
    )

    await client.query("COMMIT")

    res.status(200).json({
      success: true,
      message: "Tokens used successfully",
      remainingBalance: tokenResult.rows[0].balance - amount,
    })
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Token usage error:", error)
    res.status(400).json({
      success: false,
      message: error.message || "Failed to use tokens for purchase.",
    })
  } finally {
    client.release()
  }
})

// Get token transaction history
router.get("/history", authenticateToken, async (req, res) => {
  const userId = (req as any).user.userId

  try {
    // Get token purchases
    const purchasesResult = await pool.query(
      `SELECT purchase_id, amount, tokens, status, created_at
       FROM token_purchases
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    )

    // Get token usage
    const usageResult = await pool.query(
      `SELECT tu.usage_id, tu.tokens_used, tu.created_at, o.order_id, a.name as agent_name
       FROM token_usage tu
       JOIN orders o ON tu.order_id = o.order_id
       JOIN ai_agents a ON o.agent_id = a.agent_id
       WHERE tu.user_id = $1
       ORDER BY tu.created_at DESC`,
      [userId],
    )

    res.status(200).json({
      purchases: purchasesResult.rows,
      usage: usageResult.rows,
    })
  } catch (error) {
    console.error("Error fetching token history:", error)
    res.status(500).json({ message: "Server error while fetching token history." })
  }
})

export default router
