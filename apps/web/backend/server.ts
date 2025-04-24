import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { Pool } from "pg"
import userRoutes from "./routes/userRoutes"
import agentRoutes from "./routes/agentRoutes"
import orderRoutes from "./routes/orderRoutes"
import tokenRoutes from "./routes/tokenRoutes"
import paymentRoutes from "./routes/paymentRoutes"
import subscriptionRoutes from "./routes/subscriptionRoutes"
import apiKeyRoutes from "./routes/apiKeyRoutes"

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Database connection
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack)
  }
  client.query("SELECT NOW()", (err, result) => {
    release()
    if (err) {
      return console.error("Error executing query", err.stack)
    }
    console.log("Connected to Database at:", result.rows[0].now)
  })
})

// Routes
app.use("/api/users", userRoutes)
app.use("/api/agents", agentRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/tokens", tokenRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/subscriptions", subscriptionRoutes)
app.use("/api/keys", apiKeyRoutes)

// Root route
app.get("/", (req, res) => {
  res.send("AI Exchange API is running")
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
