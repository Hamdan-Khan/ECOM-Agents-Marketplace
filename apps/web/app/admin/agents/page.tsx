"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/layout"
import Link from "next/link"
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
import { apiGet, apiDelete } from "@/services/api"
import { Loader2, Plus } from "lucide-react"
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

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteAgent, setDeleteAgent] = useState<Agent | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const { user, isAdmin } = useAuth()

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
      toast({
        title: "Deleting...",
        description: `Deleting agent "${deleteAgent.name}"`,
      })
      
      await apiDelete(`/agents/${deleteAgent.id}`)
      await fetchAgents()
      setDeleteAgent(null)
      
      toast({
        title: "Success",
        description: "Agent has been deleted successfully",
        variant: "default",
      })
    } catch (error: any) {
      console.error('Error deleting agent:', error)
      toast({
        title: error.status === 403 ? "Permission Denied" : "Error",
        description: error.message || "Failed to delete the agent. Please try again.",
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
            <Button asChild>
              <Link href="/admin/agents/create">
                <Plus className="h-4 w-4 mr-2" />
                New Agent
              </Link>
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
                          asChild
                        >
                          <Link href={`/admin/agents/${agent.id}/edit`}>
                            Edit
                          </Link>
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