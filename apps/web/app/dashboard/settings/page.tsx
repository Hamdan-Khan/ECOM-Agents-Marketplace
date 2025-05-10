"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { apiPost } from "@/services/api"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { user, login } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    notifications: {
      email: true,
      marketing: false
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await apiPost("/users/profile", formData)
      login(response, user?.token || "") // Update the user context with new data
      toast({
        title: "Success",
        description: "Profile settings updated successfully"
      })
    } catch (error: any) {
      if (error.status === 401) {
        router.push("/login")
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update settings",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
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
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Your email"
                />
              </div>

              <div className="space-y-4">
                <Label>Notification Preferences</Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about your orders and agents
                      </p>
                    </div>
                    <Switch
                      checked={formData.notifications.email}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          notifications: {
                            ...formData.notifications,
                            email: checked
                          }
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about new features and promotions
                      </p>
                    </div>
                    <Switch
                      checked={formData.notifications.marketing}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          notifications: {
                            ...formData.notifications,
                            marketing: checked
                          }
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delete Account</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => {
                // Implement account deletion logic
                toast({
                  title: "Not Implemented",
                  description: "Account deletion is not yet implemented",
                  variant: "destructive"
                })
              }}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 