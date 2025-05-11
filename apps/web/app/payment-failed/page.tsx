"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

const PaymentFailure = () => {
  const [error, setError] = useState<string>("");
  const router = useRouter();
  
  const { session_id } = router.query; // Get the session_id from URL

  useEffect(() => {
    if (!session_id) return;
    
    // Optionally, fetch error details from the server, if needed.
    const fetchPaymentFailureDetails = async () => {
      try {
        // Replace with your API call to fetch failure details if needed
        // const response = await apiGet(`/pay/failure/checkout/session?session_id=${session_id}`);
        // Set any additional error information here if available.
        setError("Payment failed due to an issue with your payment method.");
      } catch (err: any) {
        setError(err?.message || "An unexpected error occurred during payment.");
      }
    };
    
    fetchPaymentFailureDetails();
  }, [session_id]);

  return (
    <div className="payment-failure-container">
      <Card className="w-full max-w-md">
        <CardContent>
          <CardTitle className="text-2xl font-bold text-center text-red-500">
            Payment Failed
          </CardTitle>
          <div className="mt-4">
            <p className="text-center text-xl text-gray-700">{error}</p>
            <div className="flex justify-center mt-6 space-x-4">
              {/* Retry Button */}
              <Button
                onClick={() => router.push("/pay")}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Retry Payment
              </Button>

              {/* Back to Home Button */}
              <Button
                onClick={() => router.push("/")}
                className="bg-gray-600 text-white hover:bg-gray-700"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailure;
