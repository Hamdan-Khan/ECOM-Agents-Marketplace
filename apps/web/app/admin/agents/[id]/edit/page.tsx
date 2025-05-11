"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { apiGet, apiPatch } from "@/services/api"
import { Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Agent categories enum
const AGENT_CATEGORIES = {
  NLP: 'NLP',
  COMPUTER_VISION: 'COMPUTER_VISION',
  ANALYTICS: 'ANALYTICS', 
  BOTS: 'BOTS',
  WORKFLOW_HELPERS: 'WORKFLOW_HELPERS'
} as const;

interface Agent {
  id: string
  name: string
  description: string
  category: string
  price: number
  subscription_price: number
}

export default function EditAgentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Agent | null>(null)

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const agent: Agent = await apiGet(`/agents/${params.id}`)
        setForm(agent)
      } catch (error) {
        console.error('Error fetching agent:', error)
        toast({
          title: "Error",
          description: "Failed to load agent",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAgent()
  }, [params.id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

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
      
      await apiPatch(`/agents/${params.id}`, formData)
      
      toast({
        title: "Success",
        description: "Agent updated successfully",
      })
      
      router.push("/admin/agents")
      router.refresh()
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (!form) {
    return (
      <AdminLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Agent not found</h1>
          <Button 
            onClick={() => router.push("/admin/agents")}
            className="mt-4"
          >
            Back to Agents
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Agent</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agent Details</CardTitle>
            <CardDescription>
              Update the agent's information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AGENT_CATEGORIES).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {value.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Subscription Price *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.subscription_price}
                  onChange={(e) => setForm({ ...form, subscription_price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
