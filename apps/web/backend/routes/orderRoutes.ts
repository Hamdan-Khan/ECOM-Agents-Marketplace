import express from "express"
import { pool } from "../server"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()

// Create a new order
router.post("/", authenticateToken, async (req, res) => {
  const { items, totalPrice, paymentMethod, billingInfo } = req.body
  const userId = (req as any).user.userId

  // Start a transaction
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    // Process each item in the order
    for (const item of items) {
      // Create order record
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, agent_id, order_type, status, payment_method)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING order_id`,
        [userId, item.id, item.purchaseType, "pending", paymentMethod === "credit-card" ? "gateway" : "tokens"],
      )

      const orderId = orderResult.rows[0].order_id

      // Create transaction record
      await client.query(
        `INSERT INTO transactions (order_id, amount, currency, status, gateway_response)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.price * item.quantity, "USD", "success", JSON.stringify({ billingInfo })],
      )

      // If payment method is tokens, deduct from token balance
      if (paymentMethod === "tokens") {
        // Check if user has enough tokens
        const tokenResult = await client.query("SELECT balance FROM tokens WHERE user_id = $1", [userId])

        if (tokenResult.rows.length === 0 || tokenResult.rows[0].balance < item.price * item.quantity) {
          throw new Error("Insufficient token balance")
        }

        // Deduct tokens
        await client.query("UPDATE tokens SET balance = balance - $1 WHERE user_id = $2", [
          item.price * item.quantity,
          userId,
        ])
      }

      // Update order status to completed
      await client.query("UPDATE orders SET status = $1 WHERE order_id = $2", ["completed", orderId])
    }

    await client.query("COMMIT")

    res.status(201).json({
      message: "Order created successfully",
      success: true,
    })
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Order creation error:", error)
    res.status(500).json({ message: error.message || "Server error during order creation." })
  } finally {
    client.release()
  }
})

// Get user's orders
router.get("/user", authenticateToken, async (req, res) => {
  const userId = (req as any).user.userId

  try {
    const result = await pool.query(
      `SELECT o.order_id, o.agent_id, a.name as agent_name, o.order_type, o.status, 
              o.payment_method, o.created_at, t.amount
       FROM orders o
       JOIN ai_agents a ON o.agent_id = a.agent_id
       JOIN transactions t ON o.order_id = t.order_id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId],
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error fetching orders:", error)
    res.status(500).json({ message: "Server error while fetching orders." })
  }
})

// Get order details
router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params
  const userId = (req as any).user.userId

  try {
    const result = await pool.query(
      `SELECT o.order_id, o.agent_id, a.name as agent_name, o.order_type, o.status, 
              o.payment_method, o.created_at, t.amount, t.currency, t.status as transaction_status
       FROM orders o
       JOIN ai_agents a ON o.agent_id = a.agent_id
       JOIN transactions t ON o.order_id = t.order_id
       WHERE o.order_id = $1 AND o.user_id = $2`,
      [id, userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found." })
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error("Error fetching order details:", error)
    res.status(500).json({ message: "Server error while fetching order details." })
  }
})

export default router
