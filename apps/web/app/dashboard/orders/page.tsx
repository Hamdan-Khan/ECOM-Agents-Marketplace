"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiGet } from "@/services/api"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

interface Order {
  id: string
  agent_name: string
  amount: number
  status: string
  created_at: string
  type: 'purchase' | 'subscription'
}

export default function OrdersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await apiGet<{ items: Order[] }>("/orders")
      setOrders(response.items || [])
    } catch (error: any) {
      if (error.status === 401) {
        router.push("/login")
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch orders",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Orders Found</CardTitle>
            <CardDescription>
              You haven't placed any orders yet.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{order.agent_name}</CardTitle>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <span>{format(new Date(order.created_at), 'MMM d, yyyy')}</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                    {order.type === 'subscription' ? 'Subscription' : 'One-time Purchase'}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Order ID:</span> {order.id}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Amount:</span>{" "}
                    ${order.amount.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
} 