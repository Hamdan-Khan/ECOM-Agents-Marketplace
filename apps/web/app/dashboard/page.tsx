"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { apiGet } from "@/services/api"
import { Bot, ShoppingCart, CreditCard, Loader2 } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  token_balance: number
}

interface Order {
  id: string
  agent: {
    id: string
  }
  order_type: 'one-time' | 'subscription'
  amount: number
  payment_status: string
}

interface DashboardStats {
  totalAgents: number
  totalOrders: number
  totalSpent: number
  activeSubscriptions: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user: authUser, isInitialized, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    totalOrders: 0,
    totalSpent: 0,
    activeSubscriptions: 0
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
        const ordersResponse = await apiGet<{ items: Order[] }>(`/orders?userId=${authUser.id}`)
        const orders = ordersResponse.items || []

        // Calculate dashboard stats from orders
        const uniqueAgents = new Set(orders.map(order => order.agent?.id).filter(Boolean))
        const activeSubscriptions = orders.filter(order => 
          order.order_type === 'subscription' && order.payment_status === 'COMPLETED'
        )
        const totalSpent = orders.reduce((sum, order) => sum + (order.amount || 0), 0)

        setStats({
          totalAgents: uniqueAgents.size,
          totalOrders: orders.length,
          totalSpent: totalSpent,
          activeSubscriptions: activeSubscriptions.length
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
                <Bot className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">{stats.activeSubscriptions}</span>
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
