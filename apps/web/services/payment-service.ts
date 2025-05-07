"use client"

// This service handles payment processing through the PayPro gateway
// In a production environment, sensitive operations would be handled server-side

import { apiPost } from "@/services/api"

export type PaymentDetails = {
  orderId: string
  userId: string
  paymentGateway: string
  amount: number
  transactionId: string
}

export type PaymentResponse = {
  success: boolean
  transactionId?: string
  error?: string
}

export async function processPayment(paymentDetails: PaymentDetails): Promise<PaymentResponse> {
  try {
    const res = await apiPost<any>(
      "/payments",
      {
        order_id: paymentDetails.orderId,
        user_id: paymentDetails.userId,
        payment_gateway: paymentDetails.paymentGateway,
        amount: paymentDetails.amount,
        transaction_id: paymentDetails.transactionId,
      }
    )
    return {
      success: true,
      transactionId: res.transaction_id,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Payment processing failed",
    }
  }
}

export async function verifyPayment(transactionId: string): Promise<PaymentResponse> {
  try {
    const response = await fetch(`/api/payments/verify/${transactionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Payment verification failed")
    }

    const data = await response.json()
    return {
      success: data.verified,
      transactionId,
    }
  } catch (error: any) {
    console.error("Payment verification error:", error)
    return {
      success: false,
      error: error.message || "An unexpected error occurred during payment verification",
    }
  }
}
