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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { apiGet, apiPost, apiPut, apiDelete } from "@/services/api"
import { Loader2, Plus } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { ErrorBoundary } from "@/components/error-boundary"
import { useAuth } from "@/hooks/use-auth"

interface Agent {
  id: string
  name: string
  description: string
  category: string
  price: number | string
  subscription_price: number | string
  created_by: string
  created_at: string
}

interface AgentFormData {
  name: string
  description: string
  category: string
  price: number
  subscription_price: number
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [editAgent, setEditAgent] = useState<Agent | null>(null)
  const [deleteAgent, setDeleteAgent] = useState<Agent | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<AgentFormData>({
    name: "",
    description: "",
    category: "",
    price: 0,
    subscription_price: 0,
  })
  const { toast } = useToast()
  const { user, isAdmin } = useAuth()
  console.log("is admin", isAdmin);

  useEffect(() => {
    // Delay initial fetch to avoid hydration issues
    const timer = setTimeout(() => {
      fetchAgents()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      const response = await apiGet<{ items: Agent[] }>("/agents")
      const items = response?.items || []
      const formattedItems = items.map(agent => ({
        ...agent,
        price: typeof agent.price === 'string' ? parseFloat(agent.price) : Number(agent.price) || 0,
        subscription_price: typeof agent.subscription_price === 'string' ? parseFloat(agent.subscription_price) : Number(agent.subscription_price) || 0
      }))
      setAgents(formattedItems)
    } catch (error: any) {
      console.error('Error fetching agents:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch agents",
        variant: "destructive",
      })
      setAgents([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      setSaving(true)
      // Validate form
      if (!form.name || !form.description || !form.category) {
        throw new Error("Please fill in all required fields")
      }
      if (form.price < 0 || form.subscription_price < 0) {
        throw new Error("Price cannot be negative")
      }

      const formData = {
        ...form,
        price: parseFloat(form.price.toString()),
        subscription_price: parseFloat(form.subscription_price.toString())
      }
      await apiPost("/agents", formData)
      await fetchAgents()
      setShowNewDialog(false)
      setForm({
        name: "",
        description: "",
        category: "",
        price: 0,
        subscription_price: 0,
      })
      toast({
        title: "Success",
        description: "Agent created successfully",
      })
    } catch (error: any) {
      console.error('Error creating agent:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create agent",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (agent: Agent) => {
    setEditAgent(agent)
    setForm({
      name: agent.name,
      description: agent.description,
      category: agent.category,
      price: typeof agent.price === 'string' ? parseFloat(agent.price) : agent.price,
      subscription_price: typeof agent.subscription_price === 'string' ? parseFloat(agent.subscription_price) : agent.subscription_price,
    })
  }

  const handleSave = async () => {
    if (!editAgent) return

    try {
      setSaving(true)
      // Validate form
      if (!form.name || !form.description || !form.category) {
        throw new Error("Please fill in all required fields")
      }
      if (form.price < 0 || form.subscription_price < 0) {
        throw new Error("Price cannot be negative")
      }

      const formData = {
        ...form,
        price: parseFloat(form.price.toString()),
        subscription_price: parseFloat(form.subscription_price.toString())
      }
      await apiPut(`/agents/${editAgent.id}`, formData)
      await fetchAgents()
      setEditAgent(null)
      toast({
        title: "Success",
        description: "Agent updated successfully",
      })
    } catch (error: any) {
      console.error('Error updating agent:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update agent",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (agent: Agent) => {
    // Only allow deletion if the user is an admin or the creator of the agent
    if (!isAdmin) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete this agent",
        variant: "destructive",
      })
      return
    }
    setDeleteAgent(agent)
  }

  const confirmDelete = async () => {
    if (!deleteAgent) return

    try {
      setSaving(true)
      await apiDelete(`/agents/${deleteAgent.id}`)
      await fetchAgents()
      setDeleteAgent(null)
      toast({
        title: "Success",
        description: "Agent deleted successfully",
      })
    } catch (error: any) {
      console.error('Error deleting agent:', error)
      
      // The error object from our API service always has a message and status
      const errorMessage = error.message || "Failed to delete agent"

      toast({
        title: error.status === 403 ? "Permission Denied" : "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Helper function to safely format price
  const formatPrice = (price: any): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price)
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
  }

  // Format date safely to avoid hydration issues
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return dateString
    }
  }

  // Show loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <ErrorBoundary>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">AI Agents</h1>
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          </div>

          <div className="flex items-center justify-between">
            <Input
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Agent
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Agents</CardTitle>
              <CardDescription>
                Manage AI agents in the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>{agent.name}</TableCell>
                      <TableCell>{agent.category}</TableCell>
                      <TableCell>${formatPrice(agent.price)}</TableCell>
                      <TableCell>${formatPrice(agent.subscription_price)}</TableCell>
                      <TableCell>{agent.created_by}</TableCell>
                      <TableCell>
                        {formatDate(agent.created_at)}
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(agent)}
                          disabled={saving}
                        >
                          Edit
                        </Button>
                        {(isAdmin || agent.created_by === user?.id) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(agent)}
                            disabled={saving}
                          >
                            Delete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* New Agent Dialog */}
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <DialogDescription>
                Add a new AI agent to the marketplace
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subscription Price *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.subscription_price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      subscription_price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewDialog(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Agent'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Agent Dialog */}
        <Dialog open={!!editAgent} onOpenChange={() => setEditAgent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Agent</DialogTitle>
              <DialogDescription>
                Update agent information and pricing
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subscription Price *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.subscription_price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      subscription_price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditAgent(null)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteAgent} onOpenChange={() => setDeleteAgent(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the agent
                and remove it from the marketplace.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ErrorBoundary>
    </AdminLayout>
  )
} 