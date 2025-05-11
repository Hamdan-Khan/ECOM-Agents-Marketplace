"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { apiPost } from "@/services/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

// Agent categories enum
const AGENT_CATEGORIES = {
  NLP: 'NLP',
  COMPUTER_VISION: 'COMPUTER_VISION',
  ANALYTICS: 'ANALYTICS', 
  BOTS: 'BOTS',
  WORKFLOW_HELPERS: 'WORKFLOW_HELPERS'
} as const;

interface FormData {
  name: string
  description: string
  category: string
  price: number
  subscription_price: number
}

export default function CreateAgentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    category: "",
    price: 0,
    subscription_price: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      // Validate form
      if (!form.name || !form.description || !form.category) {
        throw new Error("Please fill in all required fields")
      }
      if (form.price < 0 || form.subscription_price < 0) {
        throw new Error("Price cannot be negative")
      }

      const formData = {
        ...form,
        price: Number(form.price),
        subscription_price: Number(form.subscription_price)
      }
      
      await apiPost("/agents", formData)
      
      toast({
        title: "Success",
        description: "Agent created successfully",
      })
      
      router.push("/admin/agents")
    } catch (error: any) {
      console.error('Error creating agent:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create agent",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Create New Agent</h1>
          <Button variant="outline" asChild>
            <Link href="/admin/agents">Cancel</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agent Details</CardTitle>
            <CardDescription>
              Fill in the details to create a new AI agent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter agent name"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter agent description"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                  disabled={loading}
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
                  placeholder="Enter price"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Subscription Price</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.subscription_price}
                  onChange={(e) => setForm({ ...form, subscription_price: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter subscription price (optional)"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Agent'
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/agents">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
