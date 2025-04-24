"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Key, Code } from "lucide-react"

// Mock data for purchased agents
const mockPurchasedAgents = [
  {
    id: 1,
    name: "TextAnalyzer Pro",
    category: "NLP",
    purchaseDate: "2023-05-15",
    purchaseType: "one-time",
    status: "active",
  },
  {
    id: 3,
    name: "DataPredictor",
    category: "Predictive Analytics",
    purchaseDate: "2023-06-22",
    purchaseType: "subscription",
    status: "active",
    nextBillingDate: "2023-07-22",
  },
]

// Mock data for order history
const mockOrders = [
  {
    id: 101,
    agentName: "TextAnalyzer Pro",
    date: "2023-05-15",
    amount: 49.99,
    status: "completed",
    paymentMethod: "Credit Card",
  },
  {
    id: 102,
    agentName: "DataPredictor",
    date: "2023-06-22",
    amount: 19.99,
    status: "completed",
    paymentMethod: "Tokens",
  },
  {
    id: 103,
    agentName: "DataPredictor",
    date: "2023-07-22",
    amount: 19.99,
    status: "pending",
    paymentMethod: "Credit Card",
  },
]

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [tokenBalance, setTokenBalance] = useState(0)
  const [purchasedAgents, setPurchasedAgents] = useState(mockPurchasedAgents)
  const [orders, setOrders] = useState(mockOrders)
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptionCount, setSubscriptionCount] = useState(0)
  const [apiKeyCount, setApiKeyCount] = useState(0)

  // Simulate fetching user data
  useEffect(() => {
    const fetchUserData = async () => {
      // In a real implementation, this would be an API call
      // const token = localStorage.getItem('token')
      // const response = await fetch('/api/users/profile', {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // })
      // const data = await response.json()
      // setUser(data.user)
      // setTokenBalance(data.tokenBalance)

      // For now, we'll use mock data
      setTimeout(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
        setTokenBalance(100)
        setPurchasedAgents(mockPurchasedAgents)
        setOrders(mockOrders)
        setSubscriptionCount(1) // Mock subscription count
        setApiKeyCount(2) // Mock API key count
        setIsLoading(false)
      }, 500)
    }

    fetchUserData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">Please log in to access your dashboard.</p>
            <Button asChild>
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Token Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tokenBalance}</div>
              <Button size="sm" className="mt-2" asChild>
                <Link href="/tokens">Purchase Tokens</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchasedAgents.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {purchasedAgents.filter((a) => a.purchaseType === "subscription").length} subscriptions
              </p>
              {subscriptionCount > 0 && (
                <Button size="sm" variant="outline" className="mt-2" asChild>
                  <Link href="/dashboard/subscriptions">Manage Subscriptions</Link>
                </Button>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">API Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiKeyCount}</div>
              <p className="text-xs text-muted-foreground mt-1">For agent integrations</p>
              <Button size="sm" variant="outline" className="mt-2" asChild>
                <Link href="/dashboard/api-keys">
                  <Key className="h-4 w-4 mr-2" />
                  Manage API Keys
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchasedAgents.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Available for integration</p>
              <Button size="sm" variant="outline" className="mt-2" asChild>
                <Link href="/dashboard/integrations">
                  <Code className="h-4 w-4 mr-2" />
                  View Integrations
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="agents">
          <TabsList className="mb-4">
            <TabsTrigger value="agents">My Agents</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle>My AI Agents</CardTitle>
                <CardDescription>Manage your purchased AI agents and subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                {purchasedAgents.length > 0 ? (
                  <div className="divide-y">
                    {purchasedAgents.map((agent) => (
                      <div key={agent.id} className="py-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="mr-2">
                              {agent.category}
                            </Badge>
                            <span className="text-sm text-muted-foreground">Purchased: {agent.purchaseDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge
                            className={
                              agent.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {agent.status}
                          </Badge>
                          <Button variant="ghost" size="sm" className="ml-4" asChild>
                            <Link href={`/dashboard/integrations/${agent.id}`}>Integrate</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You haven't purchased any AI agents yet.</p>
                    <Button asChild>
                      <a href="/agents">Browse Agents</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View your past and upcoming orders</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-2 font-medium">Order ID</th>
                          <th className="pb-2 font-medium">Agent</th>
                          <th className="pb-2 font-medium">Date</th>
                          <th className="pb-2 font-medium">Amount</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 font-medium">Payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b">
                            <td className="py-3">#{order.id}</td>
                            <td className="py-3">{order.agentName}</td>
                            <td className="py-3">{order.date}</td>
                            <td className="py-3">${order.amount.toFixed(2)}</td>
                            <td className="py-3">
                              <Badge
                                className={
                                  order.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }
                              >
                                {order.status}
                              </Badge>
                            </td>
                            <td className="py-3">{order.paymentMethod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You don't have any orders yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integration Tools</CardTitle>
                <CardDescription>Access tools to integrate AI agents into your applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Key className="h-5 w-5 mr-2" />
                        API Keys
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Create and manage API keys for secure access to your purchased AI agents.
                      </p>
                      <p className="text-sm mb-2">
                        <span className="font-medium">Active Keys:</span> {apiKeyCount}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild>
                        <Link href="/dashboard/api-keys">Manage API Keys</Link>
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Code className="h-5 w-5 mr-2" />
                        Integration Docs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Access documentation, code examples, and integration guides for your AI agents.
                      </p>
                      <p className="text-sm mb-2">
                        <span className="font-medium">Available Integrations:</span> {purchasedAgents.length}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild>
                        <Link href="/dashboard/integrations">View Integrations</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
