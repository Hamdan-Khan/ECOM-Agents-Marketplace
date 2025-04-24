"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

// Mock data for agents
const mockAgents = [
  {
    id: 1,
    name: "TextAnalyzer Pro",
    description: "Advanced NLP tool for sentiment analysis and text classification.",
    category: "NLP",
    price: 49.99,
    subscription_price: 9.99,
    developer_id: 2,
  },
  {
    id: 2,
    name: "ImageVision AI",
    description: "Computer vision tool for object detection and image classification.",
    category: "Computer Vision",
    price: 79.99,
    subscription_price: 14.99,
    developer_id: 3,
  },
  {
    id: 3,
    name: "DataPredictor",
    description: "Predictive analytics tool for forecasting business metrics.",
    category: "Predictive Analytics",
    price: 99.99,
    subscription_price: 19.99,
    developer_id: 2,
  },
]

// Mock data for orders
const mockOrders = [
  {
    id: 101,
    user_id: 5,
    user_email: "customer1@example.com",
    agent_name: "TextAnalyzer Pro",
    date: "2023-05-15",
    amount: 49.99,
    status: "completed",
    payment_method: "Credit Card",
  },
  {
    id: 102,
    user_id: 6,
    user_email: "customer2@example.com",
    agent_name: "DataPredictor",
    date: "2023-06-22",
    amount: 19.99,
    status: "completed",
    payment_method: "Tokens",
  },
  {
    id: 103,
    user_id: 5,
    user_email: "customer1@example.com",
    agent_name: "DataPredictor",
    date: "2023-07-22",
    amount: 19.99,
    status: "pending",
    payment_method: "Credit Card",
  },
]

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [agents, setAgents] = useState(mockAgents)
  const [orders, setOrders] = useState(mockOrders)
  const [isLoading, setIsLoading] = useState(true)
  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    subscription_price: "",
    developer_id: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  // Simulate fetching user data and checking admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      // In a real implementation, this would verify the JWT and check the role
      // const token = localStorage.getItem('token')
      // const response = await fetch('/api/users/profile', {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // })
      // const data = await response.json()
      // setUser(data.user)
      // setIsAdmin(data.user.role === 'admin')

      // For now, we'll use mock data
      setTimeout(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          setIsAdmin(parsedUser.role === "admin")
        }
        setAgents(mockAgents)
        setOrders(mockOrders)
        setIsLoading(false)
      }, 500)
    }

    checkAdminStatus()
  }, [])

  const handleNewAgentChange = (field: string, value: string) => {
    setNewAgent({
      ...newAgent,
      [field]: value,
    })
  }

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!newAgent.name || !newAgent.description || !newAgent.category || !newAgent.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // In a real implementation, this would be an API call
    // For now, we'll just add to the local state
    const newAgentWithId = {
      ...newAgent,
      id: agents.length + 1,
      price: Number.parseFloat(newAgent.price),
      subscription_price: newAgent.subscription_price ? Number.parseFloat(newAgent.subscription_price) : null,
      developer_id: newAgent.developer_id ? Number.parseInt(newAgent.developer_id) : null,
    }

    setAgents([...agents, newAgentWithId])

    // Reset form
    setNewAgent({
      name: "",
      description: "",
      category: "",
      price: "",
      subscription_price: "",
      developer_id: "",
    })

    toast({
      title: "Agent Added",
      description: `${newAgent.name} has been added successfully.`,
    })
  }

  const handleDeleteAgent = (id: number) => {
    // In a real implementation, this would be an API call
    // For now, we'll just remove from the local state
    setAgents(agents.filter((agent) => agent.id !== id))

    toast({
      title: "Agent Deleted",
      description: "The agent has been deleted successfully.",
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">You don't have permission to access the admin panel.</p>
            <Button asChild>
              <a href="/">Return to Home</a>
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
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        {/* Main Content Tabs */}
        <Tabs defaultValue="agents">
          <TabsList className="mb-4">
            <TabsTrigger value="agents">Manage Agents</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Add New Agent Form */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Add New Agent</CardTitle>
                  <CardDescription>Create a new AI agent listing</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddAgent} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newAgent.name}
                        onChange={(e) => handleNewAgentChange("name", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newAgent.description}
                        onChange={(e) => handleNewAgentChange("description", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newAgent.category}
                        onValueChange={(value) => handleNewAgentChange("category", value)}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NLP">NLP</SelectItem>
                          <SelectItem value="Computer Vision">Computer Vision</SelectItem>
                          <SelectItem value="Predictive Analytics">Predictive Analytics</SelectItem>
                          <SelectItem value="Speech Recognition">Speech Recognition</SelectItem>
                          <SelectItem value="Recommendation Systems">Recommendation Systems</SelectItem>
                          <SelectItem value="Conversational AI">Conversational AI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newAgent.price}
                        onChange={(e) => handleNewAgentChange("price", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subscription_price">Subscription Price ($/month)</Label>
                      <Input
                        id="subscription_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newAgent.subscription_price}
                        onChange={(e) => handleNewAgentChange("subscription_price", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="developer_id">Developer ID</Label>
                      <Input
                        id="developer_id"
                        type="number"
                        value={newAgent.developer_id}
                        onChange={(e) => handleNewAgentChange("developer_id", e.target.value)}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      Add Agent
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Agent List */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>AI Agents</CardTitle>
                  <CardDescription>Manage existing AI agent listings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-2 font-medium">ID</th>
                          <th className="pb-2 font-medium">Name</th>
                          <th className="pb-2 font-medium">Category</th>
                          <th className="pb-2 font-medium">Price</th>
                          <th className="pb-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agents.map((agent) => (
                          <tr key={agent.id} className="border-b">
                            <td className="py-3">{agent.id}</td>
                            <td className="py-3">{agent.name}</td>
                            <td className="py-3">
                              <Badge variant="outline">{agent.category}</Badge>
                            </td>
                            <td className="py-3">${agent.price.toFixed(2)}</td>
                            <td className="py-3">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteAgent(agent.id)}>
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>View and manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-2 font-medium">Order ID</th>
                        <th className="pb-2 font-medium">Customer</th>
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
                          <td className="py-3">{order.user_email}</td>
                          <td className="py-3">{order.agent_name}</td>
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
                          <td className="py-3">{order.payment_method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
