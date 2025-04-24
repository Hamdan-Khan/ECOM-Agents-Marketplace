"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import { processPayment, type PaymentDetails } from "@/services/payment-service"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [tokenBalance, setTokenBalance] = useState(100) // Mock token balance
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [billingInfo, setBillingInfo] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  })
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  // Check if cart is empty or user is not logged in
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
      return
    }

    const user = localStorage.getItem("user")
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to proceed with checkout.",
        variant: "destructive",
      })
      router.push("/login?redirect=checkout")
    }

    // In a real app, we would fetch the user's token balance here
    // For now, we'll use a mock value
    const fetchTokenBalance = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const response = await fetch("/api/tokens/balance", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setTokenBalance(data.balance)
        }
      } catch (error) {
        console.error("Error fetching token balance:", error)
      }
    }

    fetchTokenBalance()
  }, [items.length, router, toast])

  const handleBillingInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillingInfo({
      ...billingInfo,
      [e.target.name]: e.target.value,
    })
  }

  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentInfo({
      ...paymentInfo,
      [e.target.name]: e.target.value,
    })
  }

  const createOrder = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Authentication required")

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          totalPrice,
          paymentMethod,
          billingInfo,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create order")
      }

      const data = await response.json()
      return data.orderId
    } catch (error: any) {
      console.error("Order creation error:", error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate form based on payment method
      if (paymentMethod === "credit-card") {
        if (!paymentInfo.cardNumber || !paymentInfo.cardName || !paymentInfo.expiry || !paymentInfo.cvc) {
          throw new Error("Please fill in all payment details")
        }
      } else if (paymentMethod === "tokens") {
        if (tokenBalance < totalPrice) {
          throw new Error("Insufficient token balance")
        }
      }

      // Create order first
      const newOrderId = await createOrder()
      setOrderId(newOrderId)

      // Process payment based on method
      if (paymentMethod === "credit-card") {
        const paymentDetails: PaymentDetails = {
          cardNumber: paymentInfo.cardNumber,
          cardName: paymentInfo.cardName,
          expiry: paymentInfo.expiry,
          cvc: paymentInfo.cvc,
          amount: totalPrice,
          currency: "USD",
          description: `AI Exchange order #${newOrderId}`,
          orderId: newOrderId,
        }

        const paymentResult = await processPayment(paymentDetails)

        if (!paymentResult.success) {
          throw new Error(paymentResult.error || "Payment processing failed")
        }
      } else if (paymentMethod === "tokens") {
        // Process token payment
        const response = await fetch("/api/tokens/use", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            amount: totalPrice,
            orderId: newOrderId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Token payment failed")
        }
      }

      // Clear the cart
      clearCart()

      // Set flag for order confirmation page
      sessionStorage.setItem("orderCompleted", "true")

      // Show success message
      toast({
        title: "Order Successful",
        description: "Your order has been processed successfully.",
      })

      // Redirect to order confirmation page
      router.push("/checkout/confirmation")
    } catch (error: any) {
      setError(error.message || "An error occurred during checkout")
      toast({
        title: "Checkout Failed",
        description: error.message || "An error occurred during checkout.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const hasInsufficientTokens = paymentMethod === "tokens" && tokenBalance < totalPrice

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={billingInfo.name}
                        onChange={handleBillingInfoChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={billingInfo.email}
                        onChange={handleBillingInfoChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={billingInfo.address}
                      onChange={handleBillingInfoChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={billingInfo.city}
                        onChange={handleBillingInfoChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        name="state"
                        value={billingInfo.state}
                        onChange={handleBillingInfoChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP/Postal Code</Label>
                      <Input id="zip" name="zip" value={billingInfo.zip} onChange={handleBillingInfoChange} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={billingInfo.country}
                      onChange={handleBillingInfoChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <Label htmlFor="credit-card">Credit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tokens" id="tokens" />
                      <Label htmlFor="tokens">Tokens (Balance: {tokenBalance})</Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "credit-card" && (
                    <div className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentInfo.cardNumber}
                          onChange={handlePaymentInfoChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          name="cardName"
                          placeholder="John Doe"
                          value={paymentInfo.cardName}
                          onChange={handlePaymentInfoChange}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            name="expiry"
                            placeholder="MM/YY"
                            value={paymentInfo.expiry}
                            onChange={handlePaymentInfoChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input
                            id="cvc"
                            name="cvc"
                            placeholder="123"
                            value={paymentInfo.cvc}
                            onChange={handlePaymentInfoChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "tokens" && (
                    <div className="mt-6">
                      {hasInsufficientTokens ? (
                        <div className="text-red-500 mb-4">
                          Insufficient token balance. You need {totalPrice - tokenBalance} more tokens.
                        </div>
                      ) : (
                        <div className="text-green-600 mb-4">You have enough tokens for this purchase.</div>
                      )}
                      <Button variant="outline" type="button" asChild>
                        <a href="/tokens">Purchase More Tokens</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" disabled={isLoading || hasInsufficientTokens}>
                {isLoading ? "Processing..." : `Complete Purchase ($${totalPrice.toFixed(2)})`}
              </Button>
            </form>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.purchaseType}`} className="py-3 flex justify-between">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.purchaseType === "one-time" ? "One-time purchase" : "Monthly subscription"}
                        </div>
                        <div className="text-sm">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-right">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
