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

interface Order {
  id: string
  user_id: string
  agent_id: string
  payment_status: string
  order_type: string
  price: number
  created_at: string
  user_name: string
  agent_name: string
}

interface OrderDetails extends Order {
  payment_history: Array<{
    id: string
    status: string
    amount: number
    created_at: string
  }>
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [viewOrder, setViewOrder] = useState<OrderDetails | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await apiGet<{ items: Order[] }>("/orders")
      setOrders(data.items || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleView = async (order: Order) => {
    try {
      setLoadingDetails(true)
      const details = await apiGet<OrderDetails>(`/orders/${order.id}`)
      setViewOrder(details)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch order details",
        variant: "destructive",
      })
    } finally {
      setLoadingDetails(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toString().includes(search) ||
      order.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.agent_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Orders</h1>
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>View and manage marketplace orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.user_name || order.user_id}</TableCell>
                    <TableCell>{order.agent_name || order.agent_id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{order.order_type}</Badge>
                    </TableCell>
                    <TableCell>${order.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(order.payment_status)}
                        variant="outline"
                      >
                        {order.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(order)}
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

      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Detailed information about the order
            </DialogDescription>
          </DialogHeader>
          {loadingDetails ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : viewOrder ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Order Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Order ID:</span> {viewOrder.id}
                    </p>
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {viewOrder.order_type}
                    </p>
                    <p>
                      <span className="font-medium">Price:</span> $
                      {viewOrder.price.toFixed(2)}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {viewOrder.payment_status}
                    </p>
                    <p>
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(viewOrder.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">User & Agent</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">User:</span>{" "}
                      {viewOrder.user_name || viewOrder.user_id}
                    </p>
                    <p>
                      <span className="font-medium">Agent:</span>{" "}
                      {viewOrder.agent_name || viewOrder.agent_id}
                    </p>
                  </div>
                </div>
              </div>

              {viewOrder.payment_history && (
                <div>
                  <h3 className="font-medium mb-2">Payment History</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewOrder.payment_history.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.id}</TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusColor(payment.status)}
                              variant="outline"
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            {new Date(payment.created_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
} 