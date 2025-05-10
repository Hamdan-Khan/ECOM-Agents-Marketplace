"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { apiGet, apiPost } from "@/services/api"
import { format } from 'date-fns'
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react"

interface Agent {
  id: string
  name: string
  description: string
  category: string
  price: number
  subscription_price?: number | null
  created_by: string
  created_at: string
  updated_at: string
}

export default function MyAgentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchAgents()
    }
  }, [user])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      const response = await apiGet<{ items: Agent[] }>("/agents/my")
      setAgents(response.items || [])
    } catch (error: any) {
      if (error.status === 401) {
        router.push("/login")
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch agents",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (agent: Agent) => {
    router.push(`/dashboard/my-agents/${agent.id}/edit`)
  }

  const handleDelete = async (agent: Agent) => {
    if (!window.confirm(`Are you sure you want to delete "${agent.name}"?`)) return

    try {
      setDeletingAgentId(agent.id)
      await apiPost(`/agents/${agent.id}`, {}, { method: "DELETE" })
      toast({
        title: "Success",
        description: "Agent deleted successfully"
      })
      await fetchAgents()
    } catch (error: any) {
      if (error.status === 401) {
        router.push("/login")
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to delete agent",
          variant: "destructive"
        })
      }
    } finally {
      setDeletingAgentId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Agents</h1>
        <Button onClick={() => router.push("/dashboard/create-agent")}>
          <Plus className="w-4 h-4 mr-2" />
          Create Agent
        </Button>
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
      ) : agents.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Agents Found</CardTitle>
            <CardDescription>
              You haven't created any agents yet. Click the button above to create your first agent.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {agents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>{agent.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(agent)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(agent)}
                      disabled={deletingAgentId === agent.id}
                    >
                      {deletingAgentId === agent.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      {deletingAgentId === agent.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{agent.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    Created {format(new Date(agent.created_at), 'MMM d, yyyy')}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{agent.description}</p>
                <div className="mt-4 flex items-center gap-4">
                  <div>
                    <span className="font-medium">Price:</span>{" "}
                    ${agent.price.toFixed(2)}
                  </div>
                  {agent.subscription_price && agent.subscription_price > 0 && (
                    <div>
                      <span className="font-medium">Subscription:</span>{" "}
                      ${agent.subscription_price.toFixed(2)}/month
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
} 