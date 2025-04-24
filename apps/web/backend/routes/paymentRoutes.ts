import express from "express"
import { pool } from "../server"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()

// Process a payment
router.post("/process", authenticateToken, async (req, res) => {
  const { cardNumber, cardName, expiry, cvc, amount, currency, description, orderId } = req.body

  const userId = (req as any).user.userId

  try {
    // In a real implementation, this would communicate with the PayPro API
    // For security, never log or store full card details

    // Mask card number for logging/storage
    const maskedCardNumber = cardNumber.slice(-4).padStart(cardNumber.length, "*")

    // Simulate payment processing
    const success = Math.random() > 0.1 // 90% success rate for simulation

    if (!success) {
      throw new Error("Payment declined by gateway")
    }

    // Generate a transaction ID
    const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`

    // Record the transaction in the database
    await pool.query(
      `INSERT INTO transactions (order_id, amount, currency, status, gateway_response)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        orderId,
        amount,
        currency,
        "success",
        JSON.stringify({
          transactionId,
          maskedCardNumber,
          cardName,
          description,
          timestamp: new Date().toISOString(),
        }),
      ],
    )

    // Update order status
    await pool.query("UPDATE orders SET status = $1 WHERE order_id = $2", ["completed", orderId])

    res.status(200).json({
      success: true,
      transactionId,
      message: "Payment processed successfully",
    })
  } catch (error) {
    console.error("Payment processing error:", error)

    // Record failed transaction
    if (orderId) {
      await pool.query(
        `INSERT INTO transactions (order_id, amount, currency, status, gateway_response)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          orderId,
          amount,
          currency,
          "failed",
          JSON.stringify({
            error: error.message,
            timestamp: new Date().toISOString(),
          }),
        ],
      )

      // Update order status
      await pool.query("UPDATE orders SET status = $1 WHERE order_id = $2", ["failed", orderId])
    }

    res.status(400).json({
      success: false,
      message: error.message || "Payment processing failed",
    })
  }
})

// Verify a payment
router.get("/verify/:transactionId", authenticateToken, async (req, res) => {
  const { transactionId } = req.params

  try {
    // In a real implementation, this would verify with the PayPro API

    // Check if transaction exists in our database
    const result = await pool.query(
      `SELECT t.transaction_id, t.status, t.gateway_response, o.user_id
       FROM transactions t
       JOIN orders o ON t.order_id = o.order_id
       WHERE t.gateway_response::jsonb->>'transactionId' = $1`,
      [transactionId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        verified: false,
        message: "Transaction not found",
      })
    }

    // Check if transaction belongs to the authenticated user
    const userId = (req as any).user.userId
    if (result.rows[0].user_id !== userId) {
      return res.status(403).json({
        verified: false,
        message: "Unauthorized access to transaction",
      })
    }

    const verified = result.rows[0].status === "success"

    res.status(200).json({
      verified,
      message: verified ? "Payment verified" : "Payment verification failed",
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    res.status(500).json({
      verified: false,
      message: "Error verifying payment",
    })
  }
})

export default router
