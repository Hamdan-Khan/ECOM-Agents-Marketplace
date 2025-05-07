"use client"

import { CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Key, Code } from "lucide-react"
import { apiGet, apiPost } from "@/services/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const { user: authUser, login } = useAuth()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [tokenBalance, setTokenBalance] = useState(0)
  const [purchasedAgents, setPurchasedAgents] = useState([])
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptionCount, setSubscriptionCount] = useState(0)
  const [apiKeyCount, setApiKeyCount] = useState(0)
  const [editProfile, setEditProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: "", email: "" })
  const [payments, setPayments] = useState([])
  const [myAgents, setMyAgents] = useState([])
  const [loadingMyAgents, setLoadingMyAgents] = useState(true)
  const [errorMyAgents, setErrorMyAgents] = useState("")
  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    subscription_price: ""
  })
  const [creatingAgent, setCreatingAgent] = useState(false)
  const [editAgent, setEditAgent] = useState<any | null>(null)
  const [editAgentForm, setEditAgentForm] = useState({ name: "", description: "", category: "", price: "", subscription_price: "" })
  const [editingAgent, setEditingAgent] = useState(false)
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null)
  const [viewOrder, setViewOrder] = useState<any | null>(null)
  const [orderDetails, setOrderDetails] = useState<any | null>(null)
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false)
  const [errorOrderDetails, setErrorOrderDetails] = useState("")
  const [viewPayment, setViewPayment] = useState<any | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null)
  const [loadingPaymentDetails, setLoadingPaymentDetails] = useState(false)
  const [errorPaymentDetails, setErrorPaymentDetails] = useState("")

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        const profile = await apiGet<any>("/users/profile")
        setUser(profile)
        setProfileForm({ name: profile.name, email: profile.email })
        login(profile, localStorage.getItem("token") || "")
        setTokenBalance(profile.token_balance || 0)
        // Fetch user orders
        const ordersRes = await apiGet<any[]>(`/orders?userId=${profile.id}`)
        setOrders(ordersRes)
        // Build purchasedAgents from orders
        const agentMap: Record<string, any> = {}
        const purchased: any[] = []
        for (const order of ordersRes) {
          if (!order.agent_id) continue
          if (!agentMap[order.agent_id]) {
            // Fetch agent details if not already fetched
            try {
              const agent = await apiGet<any>(`/agents/${order.agent_id}`)
              agentMap[order.agent_id] = agent
            } catch (e) {
              continue // skip if agent fetch fails
            }
          }
          purchased.push({
            id: agentMap[order.agent_id].id,
            name: agentMap[order.agent_id].name,
            category: agentMap[order.agent_id].category,
            purchaseDate: order.created_at,
            purchaseType: order.order_type,
            status: order.payment_status === "COMPLETED" ? "active" : order.payment_status.toLowerCase(),
            // Add more fields as needed
          })
        }
        setPurchasedAgents(purchased)
        // Fetch user payments
        const paymentsRes = await apiGet<any[]>(`/payments/user/${profile.id}`)
        setPayments(paymentsRes)
        // Fetch agents created by the user
        setLoadingMyAgents(true)
        try {
          const myAgentsRes = await apiGet<any>(`/agents?created_by=${profile.id}`)
          setMyAgents(myAgentsRes.items || [])
          setErrorMyAgents("")
        } catch (e: any) {
          setErrorMyAgents(e.message || "Failed to fetch your agents")
        } finally {
          setLoadingMyAgents(false)
        }
        // TODO: Optimize with a backend endpoint for purchased agents if needed
      } catch (err) {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserData()
  }, [login])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      setIsLoading(true)
      const updated = await apiPost<any>(`/users/${user.id}`, profileForm, { method: "PATCH" })
      setUser(updated)
      setEditProfile(false)
      toast({ title: "Profile updated", description: "Your profile was updated successfully." })
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message || "Could not update profile.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewAgentChange = (field: string, value: string) => {
    setNewAgent({ ...newAgent, [field]: value })
  }

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAgent.name || !newAgent.description || !newAgent.category || !newAgent.price) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" })
      return
    }
    setCreatingAgent(true)
    try {
      await apiPost("/agents", {
        name: newAgent.name,
        description: newAgent.description,
        category: newAgent.category,
        price: parseFloat(newAgent.price),
        subscription_price: newAgent.subscription_price ? parseFloat(newAgent.subscription_price) : undefined
      })
      toast({ title: "Agent Created", description: `${newAgent.name} has been created.` })
      setNewAgent({ name: "", description: "", category: "", price: "", subscription_price: "" })
      // Refresh agent list
      setLoadingMyAgents(true)
      const profile = user
      if (profile) {
        const myAgentsRes = await apiGet<any>(`/agents?created_by=${profile.id}`)
        setMyAgents(myAgentsRes.items || [])
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to create agent.", variant: "destructive" })
    } finally {
      setCreatingAgent(false)
      setLoadingMyAgents(false)
    }
  }

  const openEditAgent = (agent: any) => {
    setEditAgent(agent)
    setEditAgentForm({
      name: agent.name || "",
      description: agent.description || "",
      category: agent.category || "",
      price: agent.price?.toString() || "",
      subscription_price: agent.subscription_price?.toString() || ""
    })
  }

  const closeEditAgent = () => {
    setEditAgent(null)
  }

  const handleEditAgentChange = (field: string, value: string) => {
    setEditAgentForm({ ...editAgentForm, [field]: value })
  }

  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editAgent) return
    if (!editAgentForm.name || !editAgentForm.description || !editAgentForm.category || !editAgentForm.price) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" })
      return
    }
    setEditingAgent(true)
    try {
      await apiPost(`/agents/${editAgent.id}`, {
        name: editAgentForm.name,
        description: editAgentForm.description,
        category: editAgentForm.category,
        price: parseFloat(editAgentForm.price),
        subscription_price: editAgentForm.subscription_price ? parseFloat(editAgentForm.subscription_price) : undefined
      }, { method: "PATCH" })
      toast({ title: "Agent Updated", description: `${editAgentForm.name} has been updated.` })
      // Refresh agent list
      setLoadingMyAgents(true)
      const profile = user
      if (profile) {
        const myAgentsRes = await apiGet<any>(`/agents?created_by=${profile.id}`)
        setMyAgents(myAgentsRes.items || [])
      }
      closeEditAgent()
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to update agent.", variant: "destructive" })
    } finally {
      setEditingAgent(false)
      setLoadingMyAgents(false)
    }
  }

  const handleDeleteAgent = async (agent: any) => {
    if (!window.confirm(`Are you sure you want to delete agent "${agent.name}"? This action cannot be undone.`)) return
    setDeletingAgentId(agent.id)
    try {
      await apiPost(`/agents/${agent.id}`, {}, { method: "DELETE" })
      toast({ title: "Agent Deleted", description: `${agent.name} has been deleted.` })
      // Refresh agent list
      setLoadingMyAgents(true)
      const profile = user
      if (profile) {
        const myAgentsRes = await apiGet<any>(`/agents?created_by=${profile.id}`)
        setMyAgents(myAgentsRes.items || [])
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to delete agent.", variant: "destructive" })
    } finally {
      setDeletingAgentId(null)
      setLoadingMyAgents(false)
    }
  }

  const handleViewOrder = async (order: any) => {
    setViewOrder(order)
    setOrderDetails(null)
    setErrorOrderDetails("")
    setLoadingOrderDetails(true)
    try {
      const details = await apiGet<any>(`/orders/${order.id}`)
      setOrderDetails(details)
    } catch (e: any) {
      setErrorOrderDetails(e.message || "Failed to fetch order details")
    } finally {
      setLoadingOrderDetails(false)
    }
  }

  const closeViewOrder = () => {
    setViewOrder(null)
    setOrderDetails(null)
    setErrorOrderDetails("")
  }

  const handleViewPayment = async (payment: any) => {
    setViewPayment(payment)
    setPaymentDetails(null)
    setErrorPaymentDetails("")
    setLoadingPaymentDetails(true)
    try {
      const details = await apiGet<any>(`/payments/${payment.id}`)
      setPaymentDetails(details)
    } catch (e: any) {
      setErrorPaymentDetails(e.message || "Failed to fetch payment details")
    } finally {
      setLoadingPaymentDetails(false)
    }
  }

  const closeViewPayment = () => {
    setViewPayment(null)
    setPaymentDetails(null)
    setErrorPaymentDetails("")
  }

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
            <TabsTrigger value="myagents">Created Agents</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
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

          <TabsContent value="myagents">
            <Card>
              <CardHeader>
                <CardTitle>Agents You Created</CardTitle>
                <CardDescription>Manage your own AI agents</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAgent} className="mb-6 space-y-4 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="agent-name">Name</label>
                    <input id="agent-name" type="text" className="w-full border rounded px-3 py-2" value={newAgent.name} onChange={e => handleNewAgentChange("name", e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="agent-description">Description</label>
                    <textarea id="agent-description" className="w-full border rounded px-3 py-2" value={newAgent.description} onChange={e => handleNewAgentChange("description", e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="agent-category">Category</label>
                    <input id="agent-category" type="text" className="w-full border rounded px-3 py-2" value={newAgent.category} onChange={e => handleNewAgentChange("category", e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="agent-price">Price ($)</label>
                    <input id="agent-price" type="number" step="0.01" min="0" className="w-full border rounded px-3 py-2" value={newAgent.price} onChange={e => handleNewAgentChange("price", e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="agent-subscription-price">Subscription Price ($/month)</label>
                    <input id="agent-subscription-price" type="number" step="0.01" min="0" className="w-full border rounded px-3 py-2" value={newAgent.subscription_price} onChange={e => handleNewAgentChange("subscription_price", e.target.value)} />
                  </div>
                  <Button type="submit" disabled={creatingAgent}>{creatingAgent ? "Creating..." : "Create Agent"}</Button>
                </form>
                {loadingMyAgents ? (
                  <div>Loading your agents...</div>
                ) : errorMyAgents ? (
                  <div className="text-red-600">{errorMyAgents}</div>
                ) : myAgents.length > 0 ? (
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
                        {myAgents.map((agent: any) => (
                          <tr key={agent.id} className="border-b">
                            <td className="py-3">{agent.id}</td>
                            <td className="py-3">{agent.name}</td>
                            <td className="py-3">{agent.category}</td>
                            <td className="py-3">${agent.price?.toFixed ? agent.price.toFixed(2) : agent.price}</td>
                            <td className="py-3">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" onClick={() => openEditAgent(agent)}>Edit</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Agent</DialogTitle>
                                    <DialogDescription>Update your agent details</DialogDescription>
                                  </DialogHeader>
                                  <form onSubmit={handleUpdateAgent} className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium mb-1" htmlFor="edit-agent-name">Name</label>
                                      <input id="edit-agent-name" type="text" className="w-full border rounded px-3 py-2" value={editAgentForm.name} onChange={e => handleEditAgentChange("name", e.target.value)} required />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1" htmlFor="edit-agent-description">Description</label>
                                      <textarea id="edit-agent-description" className="w-full border rounded px-3 py-2" value={editAgentForm.description} onChange={e => handleEditAgentChange("description", e.target.value)} required />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1" htmlFor="edit-agent-category">Category</label>
                                      <input id="edit-agent-category" type="text" className="w-full border rounded px-3 py-2" value={editAgentForm.category} onChange={e => handleEditAgentChange("category", e.target.value)} required />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1" htmlFor="edit-agent-price">Price ($)</label>
                                      <input id="edit-agent-price" type="number" step="0.01" min="0" className="w-full border rounded px-3 py-2" value={editAgentForm.price} onChange={e => handleEditAgentChange("price", e.target.value)} required />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1" htmlFor="edit-agent-subscription-price">Subscription Price ($/month)</label>
                                      <input id="edit-agent-subscription-price" type="number" step="0.01" min="0" className="w-full border rounded px-3 py-2" value={editAgentForm.subscription_price} onChange={e => handleEditAgentChange("subscription_price", e.target.value)} />
                                    </div>
                                    <DialogFooter>
                                      <Button type="submit" disabled={editingAgent}>{editingAgent ? "Saving..." : "Save Changes"}</Button>
                                      <Button type="button" variant="outline" onClick={closeEditAgent}>Cancel</Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDeleteAgent(agent)} disabled={deletingAgentId === agent.id}>{deletingAgentId === agent.id ? "Deleting..." : "Delete"}</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You haven't created any agents yet.</p>
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
                          <th className="pb-2 font-medium">Actions</th>
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
                            <td className="py-3">
                              <Button size="sm" variant="outline" onClick={() => handleViewOrder(order)}>View Details</Button>
                            </td>
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

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View your payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-2 font-medium">Payment ID</th>
                          <th className="pb-2 font-medium">Order</th>
                          <th className="pb-2 font-medium">Amount</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 font-medium">Gateway</th>
                          <th className="pb-2 font-medium">Date</th>
                          <th className="pb-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id} className="border-b">
                            <td className="py-3">#{payment.id}</td>
                            <td className="py-3">{payment.order_id}</td>
                            <td className="py-3">${payment.amount?.toFixed ? payment.amount.toFixed(2) : payment.amount}</td>
                            <td className="py-3">
                              <Badge className={
                                payment.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : payment.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }>
                                {payment.status?.toLowerCase()}
                              </Badge>
                            </td>
                            <td className="py-3">{payment.gateway || payment.payment_gateway}</td>
                            <td className="py-3">{payment.created_at ? new Date(payment.created_at).toLocaleDateString() : ""}</td>
                            <td className="py-3">
                              <Button size="sm" variant="outline" onClick={() => handleViewPayment(payment)}>View Details</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You don't have any payments yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Subscriptions</CardTitle>
                <CardDescription>Manage your active subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.filter((order) => order.order_type === "SUBSCRIPTION").length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-2 font-medium">Agent</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 font-medium">Start Date</th>
                          <th className="pb-2 font-medium">Next Billing</th>
                          <th className="pb-2 font-medium">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.filter((order) => order.order_type === "SUBSCRIPTION").map((order) => {
                          // Try to get agent details from purchasedAgents or agentMap
                          const agent = purchasedAgents.find((a) => a.id === order.agent_id) || {};
                          return (
                            <tr key={order.id} className="border-b">
                              <td className="py-3">{agent.name || order.agent_id}</td>
                              <td className="py-3">
                                <Badge className={
                                  order.payment_status === "COMPLETED"
                                    ? "bg-green-100 text-green-800"
                                    : order.payment_status === "PENDING"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }>
                                  {order.payment_status?.toLowerCase()}
                                </Badge>
                              </td>
                              <td className="py-3">{order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}</td>
                              <td className="py-3">{/* Next billing date not available in order, placeholder */}-</td>
                              <td className="py-3">${order.price?.toFixed ? order.price.toFixed(2) : order.price}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You don't have any active subscriptions.</p>
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

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent>
            {editProfile ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>Save</Button>
                  <Button type="button" variant="outline" onClick={() => setEditProfile(false)}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div>
                <div className="mb-2"><span className="font-medium">Name:</span> {user.name}</div>
                <div className="mb-2"><span className="font-medium">Email:</span> {user.email}</div>
                <Button size="sm" variant="outline" onClick={() => setEditProfile(true)}>Edit Profile</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
      <Dialog open={!!viewOrder} onOpenChange={v => { if (!v) closeViewOrder() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {loadingOrderDetails ? (
            <div>Loading...</div>
          ) : errorOrderDetails ? (
            <div className="text-red-600">{errorOrderDetails}</div>
          ) : orderDetails ? (
            <div>
              <div><b>Order ID:</b> {orderDetails.id}</div>
              <div><b>Agent:</b> {orderDetails.agent_id}</div>
              <div><b>Status:</b> {orderDetails.payment_status}</div>
              <div><b>Type:</b> {orderDetails.order_type}</div>
              <div><b>Price:</b> ${orderDetails.price}</div>
              <div><b>Created At:</b> {orderDetails.created_at}</div>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeViewOrder}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!viewPayment} onOpenChange={v => { if (!v) closeViewPayment() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {loadingPaymentDetails ? (
            <div>Loading...</div>
          ) : errorPaymentDetails ? (
            <div className="text-red-600">{errorPaymentDetails}</div>
          ) : paymentDetails ? (
            <div>
              <div><b>Payment ID:</b> {paymentDetails.id}</div>
              <div><b>Order:</b> {paymentDetails.order_id}</div>
              <div><b>Amount:</b> ${paymentDetails.amount}</div>
              <div><b>Status:</b> {paymentDetails.status}</div>
              <div><b>Gateway:</b> {paymentDetails.gateway || paymentDetails.payment_gateway}</div>
              <div><b>Date:</b> {paymentDetails.created_at}</div>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeViewPayment}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
