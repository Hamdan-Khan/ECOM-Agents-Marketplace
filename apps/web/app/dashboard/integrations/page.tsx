"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Github, Slack, MessageSquare } from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  connected: boolean
}

export default function IntegrationsPage() {
  const { toast } = useToast()
  const [connecting, setConnecting] = useState<string | null>(null)

  const integrations: Integration[] = [
    {
      id: "github",
      name: "GitHub",
      description: "Connect your GitHub account to sync repositories and automate workflows.",
      icon: Github,
      connected: false
    },
    {
      id: "slack",
      name: "Slack",
      description: "Integrate with Slack to receive notifications and control your agents.",
      icon: Slack,
      connected: false
    },
    {
      id: "discord",
      name: "Discord",
      description: "Connect Discord to manage your agents through your server.",
      icon: MessageSquare,
      connected: false
    }
  ]

  const handleConnect = async (integrationId: string) => {
    try {
      setConnecting(integrationId)
      // Implement actual integration logic here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated delay
      toast({
        title: "Not Implemented",
        description: "Integration functionality is coming soon!",
        variant: "destructive"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to connect integration",
        variant: "destructive"
      })
    } finally {
      setConnecting(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Integrations</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <integration.icon className="h-6 w-6" />
                <CardTitle>{integration.name}</CardTitle>
              </div>
              <CardDescription>{integration.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant={integration.connected ? "outline" : "default"}
                onClick={() => handleConnect(integration.id)}
                disabled={connecting === integration.id}
              >
                {connecting === integration.id ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {integration.connected ? "Disconnect" : "Connect"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  )
}
