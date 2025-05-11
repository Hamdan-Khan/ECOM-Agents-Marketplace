"use client";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { user } = useAuth();
  const { totalPrice, clearCart, items } = useCart();

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const agentIds = items.map((a) => a.id);
      const response = await fetch(
        "http://localhost:3000/pay/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalPrice,
            agentId: agentIds,
            userId: user?.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create checkout session.");
      }

      const session = await response.json();
      console.log("Session from Backend:", session);

      // Check if session.url exists
      if (!session || !session.url) {
        throw new Error("Session URL is missing from the response.");
      }

      // Log session URL to debug
      console.log("Stripe Checkout URL:", session.url);

      // Redirect to the Stripe checkout session URL
      window.location.href = session.url;

      clearCart();
    } catch (error: any) {
      setErrorMsg(error.message || "Something went wrong.");
      console.error(error); // Log the error for debugging
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Payment</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="mb-4">
                You're about to purchase an AI agent for{" "}
                <strong>${totalPrice}</strong>
              </p>
              {errorMsg && (
                <p className="text-red-500 text-sm mb-2">{errorMsg}</p>
              )}
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Redirecting..." : "Pay with Stripe"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
