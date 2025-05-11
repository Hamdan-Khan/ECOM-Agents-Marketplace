"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { apiGet } from "@/services/api"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
}

interface Order {
  id: string;
  user_id: string;
  agent_id: string;
  payment_status: 'COMPLETED' | 'PENDING' | 'FAILED';
  order_type: 'ONE_TIME' | 'SUBSCRIPTION';
  price: string;
  transaction_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface OrderWithAgent extends Order {
  agent: Agent | null;
}

interface OrdersResponse {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function OrdersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderWithAgent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      // Fetch orders for the current user
      const ordersResponse = await apiGet<OrdersResponse>(`/orders?user_id=${user.id}`)
      
      // Fetch agent details for each order
      const ordersWithAgents = await Promise.all(
        ordersResponse.items.map(async (order) => {
          try {
            const agent = await apiGet<Agent>(`/agents/${order.agent_id}`)
            return { ...order, agent }
          } catch (error) {
            console.error(`Failed to fetch agent for order ${order.id}:`, error)
            return { ...order, agent: null }
          }
        })
      )

      setOrders(ordersWithAgents)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Guard for unauthenticated users
  if (!user) {
    router.push('/login')
    return null
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
                  <CardTitle>{order.agent?.name || `Agent ${order.agent_id}`}</CardTitle>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(order.payment_status)}
                  >
                    {order.payment_status.charAt(0) + order.payment_status.slice(1).toLowerCase()}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <span>{format(new Date(order.created_at), 'MMM d, yyyy')}</span>
                  <Badge variant="outline">
                    {order.order_type === 'SUBSCRIPTION' ? 'Subscription' : 'One-time Purchase'}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Order ID:</span> {order.id}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Amount:</span>{" "}
                    ${parseFloat(order.price).toFixed(2)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Transaction ID:</span>{" "}
                    {order.transaction_id}
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