"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { apiPatch } from "@/services/api"
import { Loader2 } from "lucide-react"

interface FormData {
  name: string;
  email: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  token_balance: number;
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, setUser } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || "",
    email: user?.email || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      return router.push("/login")
    }

    // Simple validation
    if (!formData.name.trim() || !formData.email.trim()) {
      return toast({
        title: "Validation Error",
        description: "Name and email are required",
        variant: "destructive"
      })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      })
    }

    try {
      setLoading(true)
      const updatedUser: User = await apiPatch(`/users/${user.id}`, formData)
      
      // Update the global user state with the new data
      setUser(updatedUser)
      
      toast({
        title: "Success",
        description: "Profile settings updated successfully"
      })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      if (error.status === 401) {
        router.push("/login")
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update profile settings",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Your email"
                  required
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}