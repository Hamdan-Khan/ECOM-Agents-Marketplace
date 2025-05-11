"use client";

import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Shield, CreditCard, Lock, CheckCircle } from "lucide-react";
import Image from "next/image";

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

      if (!session || !session.url) {
        throw new Error("Session URL is missing from the response.");
      }

      window.location.href = session.url;
      clearCart();
    } catch (error: any) {
      setErrorMsg(error.message || "Something went wrong with the payment process.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const securityFeatures = [
    { icon: Lock, text: "256-bit SSL encryption" },
    { icon: Shield, text: "Secure payment processing" },
    { icon: CheckCircle, text: "Fraud prevention" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border">
              <Lock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Secure Checkout</span>
            </div>
            <h1 className="text-3xl font-bold">Complete Your Purchase</h1>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Powered by</span>
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                alt="Stripe"
                width={50}
                height={23}
                className="relative top-[1px]"
              />
            </div>
          </div>

          <Card className="border-2 shadow-lg">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Order Summary</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-green-600 font-medium">Secure transaction</span>
                </div>
              </div>
              <CardDescription>
                You're purchasing {items.length} {items.length === 1 ? 'agent' : 'agents'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Order Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.purchaseType === 'subscription' ? 'Monthly Subscription' : 'One-time Purchase'}
                      </p>
                    </div>
                    <p className="font-medium">${item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Total Amount */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="font-medium">Total Amount</p>
                  <p className="text-sm text-muted-foreground">Including all fees</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">USD</p>
                </div>
              </div>

              {/* Security Features */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                {securityFeatures.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex flex-col items-center text-center gap-2">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">{text}</span>
                  </div>
                ))}
              </div>

              {errorMsg && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {errorMsg}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 bg-gray-50/50 border-t">
              <Button
                className="w-full h-12 text-lg relative overflow-hidden group"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Redirecting to secure payment...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Lock className="mr-2 h-5 w-5" />
                    Pay ${totalPrice.toFixed(2)} securely
                  </span>
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                By clicking "Pay", you agree to our terms of service and will be redirected to Stripe's secure payment page.
              </p>
            </CardFooter>
          </Card>

          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">              <div className="flex items-center gap-2">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                  alt="Stripe"
                  width={40}
                  height={18}
                  unoptimized
                />
                <span>Secure payment processing</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
