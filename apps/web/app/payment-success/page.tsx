"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiGet } from "@/services/api";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;
      try {
        const response: any = await apiGet(
          `/pay/success/checkout/session?session_id=${sessionId}`
        );
        setSession(response.session);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch session details");
      }
    };

    fetchSession();
  }, [sessionId]);

  const formatAmount = (amount: number, currency: string) =>
    `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;

  return (
    <div className="max-w-2xl mx-auto mt-20 p-6 border rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Payment Successful</h1>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {session ? (
        <div className="space-y-4">
          <p>
            <strong>Customer:</strong> {session.customer_details?.name || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {session.customer_details?.email || "N/A"}
          </p>
          <p>
            <strong>Payment Status:</strong> {session.payment_status}
          </p>
          <p>
            <strong>Amount Paid:</strong>{" "}
            {formatAmount(session.amount_total, session.currency)}
          </p>
          <p>
            <strong>Payment Intent ID:</strong> {session.payment_intent}
          </p>
        </div>
      ) : !error ? (
        <p>Loading payment details...</p>
      ) : null}
    </div>
  );
}
