"use client";

import Footer from "@/components/footer";
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
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const { items, removeItem, totalPrice, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to proceed with checkout.",
        variant: "destructive",
      });
      router.push("/login?redirect=cart");
      return;
    }

    // Proceed to checkout
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {items.map((item) => (
                      <div
                        key={`${item.id}-${item.purchaseType}`}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between"
                      >
                        <div className="mb-2 sm:mb-0">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.purchaseType === "one-time"
                              ? "One-time purchase"
                              : "Monthly subscription"}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-right min-w-[80px] mr-4">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeItem(item.id, item.purchaseType)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={clearCart}>
                    Clear Cart
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/agents">Continue Shopping</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={handleCheckout}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Proceed to Checkout"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some AI agents to get started.
            </p>
            <Button asChild>
              <Link href="/agents">Browse Agents</Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
