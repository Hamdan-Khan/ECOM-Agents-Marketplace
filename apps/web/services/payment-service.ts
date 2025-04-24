"use client"

// This service handles payment processing through the PayPro gateway
// In a production environment, sensitive operations would be handled server-side

export type PaymentDetails = {
  cardNumber: string
  cardName: string
  expiry: string
  cvc: string
  amount: number
  currency: string
  description: string
}

export type PaymentResponse = {
  success: boolean
  transactionId?: string
  error?: string
}

export async function processPayment(paymentDetails: PaymentDetails): Promise<PaymentResponse> {
  try {
    // In a real implementation, this would call your backend API
    // which would then securely communicate with the payment gateway
    const response = await fetch("/api/payments/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(paymentDetails),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Payment processing failed")
    }

    const data = await response.json()
    return {
      success: true,
      transactionId: data.transactionId,
    }
  } catch (error: any) {
    console.error("Payment processing error:", error)
    return {
      success: false,
      error: error.message || "An unexpected error occurred during payment processing",
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
