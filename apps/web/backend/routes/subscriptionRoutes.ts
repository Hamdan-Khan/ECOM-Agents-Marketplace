import express from "express"
import { pool } from "../server"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()

// Get user's subscriptions
router.get("/", authenticateToken, async (req, res) => {
  const userId = (req as any).user.userId

  try {
    const result = await pool.query(
      `SELECT s.subscription_id, s.agent_id, a.name as agent_name, s.status,
              s.next_billing_date, s.payment_method, a.subscription_price as price, s.created_at
       FROM subscriptions s
       JOIN ai_agents a ON s.agent_id = a.agent_id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [userId],
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    res.status(500).json({ message: "Server error while fetching subscriptions." })
  }
})

// Get subscription details
router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params
  const userId = (req as any).user.userId

  try {
    const result = await pool.query(
      `SELECT s.subscription_id, s.agent_id, a.name as agent_name, s.status,
              s.next_billing_date, s.payment_method, a.subscription_price as price, s.created_at
       FROM subscriptions s
       JOIN ai_agents a ON s.agent_id = a.agent_id
       WHERE s.subscription_id = $1 AND s.user_id = $2`,
      [id, userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Subscription not found." })
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error("Error fetching subscription details:", error)
    res.status(500).json({ message: "Server error while fetching subscription details." })
  }
})

// Update subscription status (pause/resume)
router.post("/:id/status", authenticateToken, async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const userId = (req as any).user.userId

  // Validate status
  if (!status || !["active", "paused"].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be "active" or "paused".' })
  }

  try {
    // Check if subscription exists and belongs to user
    const checkResult = await pool.query("SELECT * FROM subscriptions WHERE subscription_id = $1 AND user_id = $2", [
      id,
      userId,
    ])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Subscription not found." })
    }

    // Update subscription status
    await pool.query(
      "UPDATE subscriptions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE subscription_id = $2",
      [status, id],
    )

    res.status(200).json({
      message: `Subscription ${status === "paused" ? "paused" : "resumed"} successfully.`,
      status,
    })
  } catch (error) {
    console.error("Error updating subscription status:", error)
    res.status(500).json({ message: "Server error while updating subscription status." })
  }
})

// Cancel subscription
router.post("/:id/cancel", authenticateToken, async (req, res) => {
  const { id } = req.params
  const userId = (req as any).user.userId

  try {
    // Check if subscription exists and belongs to user
    const checkResult = await pool.query("SELECT * FROM subscriptions WHERE subscription_id = $1 AND user_id = $2", [
      id,
      userId,
    ])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Subscription not found." })
    }

    // Update subscription status to cancelled
    await pool.query(
      "UPDATE subscriptions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE subscription_id = $2",
      ["cancelled", id],
    )

    res.status(200).json({
      message: "Subscription cancelled successfully.",
      status: "cancelled",
    })
  } catch (error) {
    console.error("Error cancelling subscription:", error)
    res.status(500).json({ message: "Server error while cancelling subscription." })
  }
})

// Create a new subscription
router.post("/", authenticateToken, async (req, res) => {
  const { agentId, paymentMethod } = req.body
  const userId = (req as any).user.userId

  // Validate input
  if (!agentId || !paymentMethod) {
    return res.status(400).json({ message: "Agent ID and payment method are required." })
  }

  // Start a transaction
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    // Check if agent exists
    const agentResult = await client.query("SELECT * FROM ai_agents WHERE agent_id = $1", [agentId])

    if (agentResult.rows.length === 0) {
      throw new Error("Agent not found.")
    }

    // Check if user already has an active subscription for this agent
    const existingSubscription = await client.query(
      `SELECT * FROM subscriptions 
       WHERE user_id = $1 AND agent_id = $2 AND status != 'cancelled'`,
      [userId, agentId],
    )

    if (existingSubscription.rows.length > 0) {
      throw new Error("You already have an active subscription for this agent.")
    }

    // Calculate next billing date (1 month from now)
    const nextBillingDate = new Date()
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

    // Create subscription
    const subscriptionResult = await client.query(
      `INSERT INTO subscriptions (user_id, agent_id, status, next_billing_date, payment_method)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING subscription_id`,
      [userId, agentId, "active", nextBillingDate, paymentMethod],
    )

    const subscriptionId = subscriptionResult.rows[0].subscription_id

    // If payment method is tokens, deduct from token balance
    if (paymentMethod === "tokens") {
      const agent = agentResult.rows[0]
      const price = agent.subscription_price

      // Check if user has enough tokens
      const tokenResult = await client.query("SELECT balance FROM tokens WHERE user_id = $1", [userId])

      if (tokenResult.rows.length === 0 || tokenResult.rows[0].balance < price) {
        throw new Error("Insufficient token balance.")
      }

      // Deduct tokens
      await client.query("UPDATE tokens SET balance = balance - $1 WHERE user_id = $2", [price, userId])

      // Record token usage
      await client.query(
        `INSERT INTO token_usage (user_id, tokens_used, subscription_id, created_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        [userId, price, subscriptionId],
      )
    }

    await client.query("COMMIT")

    res.status(201).json({
      message: "Subscription created successfully.",
      subscriptionId,
    })
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Subscription creation error:", error)
    res.status(400).json({ message: error.message || "Failed to create subscription." })
  } finally {
    client.release()
  }
})

export default router
