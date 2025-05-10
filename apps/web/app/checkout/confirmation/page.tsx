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
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrderConfirmationPage() {
  const router = useRouter();

  // Redirect if user navigated here directly without completing an order
  useEffect(() => {
    const hasCompletedOrder = sessionStorage.getItem("orderCompleted");
    if (!hasCompletedOrder) {
      router.push("/agents");
    } else {
      // Clear the flag after successful navigation
      sessionStorage.removeItem("orderCompleted");
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">
                Thank you for your purchase. Your order has been successfully
                processed.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                A confirmation email has been sent to your email address.
              </p>
              <div className="border-t pt-4">
                <p className="font-medium">What's Next?</p>
                <p className="text-sm text-muted-foreground mt-2">
                  You can access your purchased AI agents from your dashboard.
                  If you purchased a subscription, it will be automatically
                  renewed each month.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button asChild className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/agents">Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
