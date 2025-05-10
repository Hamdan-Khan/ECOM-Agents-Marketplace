'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { apiGet, apiPost } from '@/services/api'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [session, setSession] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
  const fetchSession = async () => {
    if (!sessionId) return;
    
    try {
      // Append the session_id to the URL as a query parameter
      const response = await apiGet(`/pay/success/checkout/session?session_id=${sessionId}`);
      setSession(response.session);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch session details');
    }
  };

    fetchSession()
  }, [sessionId])

  return (
    <div className="max-w-2xl mx-auto mt-20 p-6 border rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Payment Successful</h1>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {session ? (
        <pre className="text-sm bg-gray-100 p-4 rounded overflow-x-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      ) : !error ? (
        <p>Loading payment details...</p>
      ) : null}
    </div>
  )
}


