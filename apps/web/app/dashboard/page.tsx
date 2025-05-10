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
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    totalOrders: 0,
    totalSpent: 0,
    activeSubscriptions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for auth to be initialized
    if (!isInitialized) return

    // Redirect if not authenticated
    if (!authLoading && !authUser) {
      router.push('/login')
      return
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [profile, statsData] = await Promise.all([
          apiGet<User>("/users/profile"),
          apiGet<DashboardStats>("/users/stats")
        ])

        setUser(profile)
        setStats(statsData)
      } catch (error: any) {
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
                Total Agents
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
            <CardTitle>Welcome back, {user?.name || authUser.name}!</CardTitle>
            <CardDescription>
              Here's an overview of your AI agent marketplace activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Email:</span> {user?.email || authUser.email}
              </p>
              <p>
                <span className="font-medium">Token Balance:</span>{" "}
                {user?.token_balance || authUser.token_balance || 0} tokens
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
