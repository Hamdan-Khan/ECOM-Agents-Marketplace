import express from "express"
import crypto from "crypto"
import { pool } from "../server"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()

// Generate a secure API key
function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Check if user has purchased the agent
async function hasUserPurchasedAgent(userId: number, agentId: number): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1 FROM orders o
     WHERE o.user_id = $1 AND o.agent_id = $2 AND o.status = 'completed'
     UNION
     SELECT 1 FROM subscriptions s
     WHERE s.user_id = $1 AND s.agent_id = $2 AND s.status = 'active'`,
    [userId, agentId],
  )

  return result.rows.length > 0
}

// Get all API keys for a user
router.get("/", authenticateToken, async (req, res) => {
  const userId = (req as any).user.userId

  try {
    const result = await pool.query(
      `SELECT k.key_id, k.agent_id, a.name as agent_name, k.name as key_name, 
              k.status, k.created_at, k.expires_at, k.last_used
       FROM api_keys k
       JOIN ai_agents a ON k.agent_id = a.agent_id
       WHERE k.user_id = $1
       ORDER BY k.created_at DESC`,
      [userId],
    )

    // Don't return the actual API key in the list
    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error fetching API keys:", error)
    res.status(500).json({ message: "Server error while fetching API keys." })
  }
})

// Create a new API key
router.post("/", authenticateToken, async (req, res) => {
  const { agentId, name, expiresAt } = req.body
  const userId = (req as any).user.userId

  try {
    // Validate input
    if (!agentId) {
      return res.status(400).json({ message: "Agent ID is required." })
    }

    // Check if user has purchased the agent
    const hasPurchased = await hasUserPurchasedAgent(userId, agentId)
    if (!hasPurchased) {
      return res.status(403).json({ message: "You must purchase this agent before creating an API key." })
    }

    // Generate API key
    const apiKey = generateApiKey()

    // Insert into database
    const result = await pool.query(
      `INSERT INTO api_keys (user_id, agent_id, api_key, name, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING key_id, agent_id, name, status, created_at, expires_at`,
      [userId, agentId, apiKey, name || null, expiresAt || null],
    )

    // Return the newly created key with the actual API key
    res.status(201).json({
      ...result.rows[0],
      api_key: apiKey, // Only return the actual key on creation
    })
  } catch (error) {
    console.error("Error creating API key:", error)
    res.status(500).json({ message: "Server error while creating API key." })
  }
})

// Revoke an API key
router.post("/:id/revoke", authenticateToken, async (req, res) => {
  const { id } = req.params
  const userId = (req as any).user.userId

  try {
    // Check if key exists and belongs to user
    const checkResult = await pool.query("SELECT * FROM api_keys WHERE key_id = $1 AND user_id = $2", [id, userId])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "API key not found." })
    }

    // Update key status to revoked
    await pool.query("UPDATE api_keys SET status = $1 WHERE key_id = $2", ["revoked", id])

    res.status(200).json({
      message: "API key revoked successfully.",
      key_id: id,
      status: "revoked",
    })
  } catch (error) {
    console.error("Error revoking API key:", error)
    res.status(500).json({ message: "Server error while revoking API key." })
  }
})

// Rename an API key
router.put("/:id/rename", authenticateToken, async (req, res) => {
  const { id } = req.params
  const { name } = req.body
  const userId = (req as any).user.userId

  try {
    // Check if key exists and belongs to user
    const checkResult = await pool.query("SELECT * FROM api_keys WHERE key_id = $1 AND user_id = $2", [id, userId])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "API key not found." })
    }

    // Update key name
    const result = await pool.query("UPDATE api_keys SET name = $1 WHERE key_id = $2 RETURNING key_id, name", [
      name,
      id,
    ])

    res.status(200).json({
      message: "API key renamed successfully.",
      key_id: result.rows[0].key_id,
      name: result.rows[0].name,
    })
  } catch (error) {
    console.error("Error renaming API key:", error)
    res.status(500).json({ message: "Server error while renaming API key." })
  }
})

export default router
