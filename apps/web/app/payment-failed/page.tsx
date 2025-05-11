"use client"

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { apiGet } from "@/services/api";

export default function PaymentFailure() {
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get('session_id');

  useEffect(() => {
    if (!session_id) {
      setError("No payment session found");
      return;
    }
    
    const fetchPaymentFailureDetails = async () => {
      try {
        const response: any = await apiGet(`/pay/failure/checkout/session?session_id=${session_id}`);
        setError(response.error || "Payment failed due to an issue with your payment method.");
      } catch (err: any) {
        setError(err?.message || "An unexpected error occurred during payment.");
      }
    };
    
    fetchPaymentFailureDetails();
  }, [session_id]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <CardTitle className="text-2xl font-bold text-center text-red-500 mb-6">
            Payment Failed
          </CardTitle>
          <div className="mt-4">
            <p className="text-center text-gray-700 mb-8">{error}</p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => router.push("/checkout")}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Retry Payment
              </Button>

              <Button
                onClick={() => router.push("/agents")}
                variant="outline"
              >
                Back to Agents
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
