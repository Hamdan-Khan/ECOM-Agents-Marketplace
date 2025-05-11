"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { apiGet } from "@/services/api"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Payment {
  id: string
  order_id: string
  amount: number
  status: string
  gateway: string
  created_at: string
  user_name: string
  agent_name: string
}

interface PaymentDetails extends Payment {
  transaction_id: string
  gateway_response: any
  refund_history: Array<{
    id: string
    amount: number
    status: string
    created_at: string
  }>
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [viewPayment, setViewPayment] = useState<PaymentDetails | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const data = await apiGet<{ items: Payment[] }>("/payments")
      setPayments(data.items || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch payments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleView = async (payment: Payment) => {
    try {
      setLoadingDetails(true)
      const details = await apiGet<PaymentDetails>(`/payments/${payment.id}`)
      setViewPayment(details)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch payment details",
        variant: "destructive",
      })
    } finally {
      setLoadingDetails(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "succeeded":
      case "success":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredPayments = payments.filter(
    (payment) =>
      payment.id.toString().includes(search) ||
      payment.order_id.toString().includes(search) ||
      payment.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      payment.agent_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payments</h1>
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search payments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Payments</CardTitle>
            <CardDescription>View and manage payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.id}</TableCell>
                    <TableCell>{payment.order_id}</TableCell>
                    <TableCell>{payment.user_name}</TableCell>
                    <TableCell>{payment.agent_name}</TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.gateway}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(payment.status)}
                        variant="outline"
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(payment)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!viewPayment} onOpenChange={() => setViewPayment(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Detailed information about the payment
            </DialogDescription>
          </DialogHeader>
          {loadingDetails ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : viewPayment ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Payment Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Payment ID:</span>{" "}
                      {viewPayment.id}
                    </p>
                    <p>
                      <span className="font-medium">Order ID:</span>{" "}
                      {viewPayment.order_id}
                    </p>
                    <p>
                      <span className="font-medium">Amount:</span> $
                      {viewPayment.amount.toFixed(2)}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {viewPayment.status}
                    </p>
                    <p>
                      <span className="font-medium">Gateway:</span>{" "}
                      {viewPayment.gateway}
                    </p>
                    <p>
                      <span className="font-medium">Transaction ID:</span>{" "}
                      {viewPayment.transaction_id}
                    </p>
                    <p>
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(viewPayment.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">User & Agent</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">User:</span>{" "}
                      {viewPayment.user_name}
                    </p>
                    <p>
                      <span className="font-medium">Agent:</span>{" "}
                      {viewPayment.agent_name}
                    </p>
                  </div>
                </div>
              </div>

              {viewPayment.refund_history && viewPayment.refund_history.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Refund History</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Refund ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewPayment.refund_history.map((refund) => (
                        <TableRow key={refund.id}>
                          <TableCell>{refund.id}</TableCell>
                          <TableCell>${refund.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusColor(refund.status)}
                              variant="outline"
                            >
                              {refund.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(refund.created_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {viewPayment.gateway_response && (
                <div>
                  <h3 className="font-medium mb-2">Gateway Response</h3>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(viewPayment.gateway_response, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
} 