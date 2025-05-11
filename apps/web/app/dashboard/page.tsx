"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { apiGet } from "@/services/api"
import { Bot, ShoppingCart, CreditCard, Loader2, Clock } from "lucide-react"

interface User {
  id: string;
  name: string;
  email: string;
  token_balance: number;
}

interface Agent {
  id: string;
  name: string;
  price: string;
  subscription_price?: string;
}

interface Order {
  id: string;
  agent_id: string;
  payment_status: 'COMPLETED' | 'PENDING' | 'FAILED';
  order_type: 'ONE_TIME' | 'SUBSCRIPTION';
  price: string;
  created_at: string;
  agent?: Agent;
}

interface OrdersResponse {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}



interface DashboardStats {
  totalAgents: number;
  totalOrders: number;
  totalSpent: number;
  activeSubscriptions: number;
  recentOrders: Order[];
  activeSubscriptionOrders: Order[];
}

export default function DashboardPage() {
  const router = useRouter()
  const { user: authUser, isInitialized, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    totalOrders: 0,
    totalSpent: 0,
    activeSubscriptions: 0,
    recentOrders: [],
    activeSubscriptionOrders: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isInitialized) return
    if (!authLoading && !authUser) {
      router.push('/login')
      return
    }

    const fetchDashboardData = async () => {
      if (!authUser?.id) return

      try {
        setLoading(true)
        
        // Fetch user's orders
        const ordersResponse = await apiGet<OrdersResponse>(`/orders?user_id=${authUser.id}`)
        const orders = ordersResponse.items || []

        // Get unique agents (purchased or subscribed)
        const uniqueAgents = new Set(orders
          .filter(order => order.payment_status === 'COMPLETED')
          .map(order => order.agent_id)
        )

        // Get active subscriptions (completed subscription orders)
        const activeSubscriptions = orders.filter(order => 
          order.order_type === 'SUBSCRIPTION' && 
          order.payment_status === 'COMPLETED'
        )

        // Calculate total spent from completed orders
        const totalSpent = orders
          .filter(order => order.payment_status === 'COMPLETED')
          .reduce((sum, order) => sum + parseFloat(order.price), 0)

        // Get 5 most recent orders
        const recentOrders = [...orders]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)


        setStats({
          totalAgents: uniqueAgents.size,
          totalOrders: orders.length,
          totalSpent: totalSpent,
          activeSubscriptions: activeSubscriptions.length,
          recentOrders,
          activeSubscriptionOrders: activeSubscriptions

        })
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error)
        toast({
          title: "Error",
          description: error.message || "Failed to fetch dashboard data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    if (authUser) {
      fetchDashboardData()
    }
  }, [authUser, isInitialized, authLoading, router, toast])

  // Show loading state while auth is initializing
  if (!isInitialized || authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  // Auth is initialized but no user - this will redirect
  if (!authUser) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access your dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600"
      case "PENDING":
        return "text-yellow-600"
      case "FAILED":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Purchased Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Bot className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">{stats.totalAgents}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ShoppingCart className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">{stats.totalOrders}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">
                  ${stats.totalSpent.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Active Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">{stats.activeSubscriptions}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest agent purchases and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{order.agent?.name || `Agent ${order.agent_id}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${parseFloat(order.price).toFixed(2)}</p>
                      <p className={`text-sm ${getStatusColor(order.payment_status)}`}>
                        {order.payment_status.charAt(0) + order.payment_status.slice(1).toLowerCase()}
                      </p>
                    </div>
                  </div>
                ))}
                {stats.recentOrders.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No recent transactions found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>
                Your current active agent subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.activeSubscriptionOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{order.agent?.name || `Agent ${order.agent_id}`}</p>
                      <p className="text-sm text-muted-foreground">
                        Started {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${parseFloat(order.price).toFixed(2)}/month
                      </p>
                      <p className="text-sm text-green-600">Active</p>
                    </div>
                  </div>
                ))}
                {stats.activeSubscriptionOrders.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No active subscriptions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome back, {authUser.name}!</CardTitle>
            <CardDescription>
              Here's an overview of your AI agent marketplace activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Email:</span> {authUser.email}
              </p>
              <p>
                <span className="font-medium">Token Balance:</span>{" "}
                {authUser.token_balance || 0} tokens
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
