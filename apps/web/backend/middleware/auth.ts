import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

interface AuthRequest extends Request {
  user?: {
    userId: number
    email: string
    role: string
  }
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number
      email: string
      role: string
    }

    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ message: "Invalid token." })
  }
}

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." })
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin privileges required." })
  }

  next()
}
