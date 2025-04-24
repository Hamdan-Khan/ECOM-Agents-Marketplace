"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Copy, Key, RefreshCw, Trash2 } from "lucide-react"

type ApiKey = {
  key_id: number
  agent_id: number
  agent_name: string
  key_name: string | null
  status: "active" | "revoked"
  created_at: string
  expires_at: string | null
  last_used: string | null
}

type Agent = {
  id: number
  name: string
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [purchasedAgents, setPurchasedAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newKeyName, setNewKeyName] = useState("")
  const [selectedAgent, setSelectedAgent] = useState<string>("")
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login?redirect=dashboard/api-keys")
          return
        }

        // In a real implementation, these would be API calls
        // For now, we'll use mock data
        setTimeout(() => {
          // Mock API keys
          setApiKeys([
            {
              key_id: 1,
              agent_id: 1,
              agent_name: "TextAnalyzer Pro",
              key_name: "Production Key",
              status: "active",
              created_at: "2023-07-15T00:00:00Z",
              expires_at: null,
              last_used: "2023-07-20T00:00:00Z",
            },
            {
              key_id: 2,
              agent_id: 3,
              agent_name: "DataPredictor",
              key_name: "Testing Key",
              status: "active",
              created_at: "2023-07-16T00:00:00Z",
              expires_at: "2023-10-16T00:00:00Z",
              last_used: null,
            },
            {
              key_id: 3,
              agent_id: 1,
              agent_name: "TextAnalyzer Pro",
              key_name: "Development Key",
              status: "revoked",
              created_at: "2023-07-10T00:00:00Z",
              expires_at: null,
              last_used: "2023-07-12T00:00:00Z",
            },
          ])

          // Mock purchased agents
          setPurchasedAgents([
            { id: 1, name: "TextAnalyzer Pro" },
            { id: 3, name: "DataPredictor" },
          ])

          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load API keys",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, toast])

  const handleCreateKey = async () => {
    try {
      if (!selectedAgent) {
        toast({
          title: "Error",
          description: "Please select an agent",
          variant: "destructive",
        })
        return
      }

      setIsLoading(true)

      // In a real implementation, this would be an API call
      // const response = await fetch('/api/keys', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({
      //     agentId: parseInt(selectedAgent),
      //     name: newKeyName || null
      //   })
      // })

      // if (!response.ok) {
      //   throw new Error('Failed to create API key')
      // }

      // const data = await response.json()

      // Mock response
      const mockApiKey =
        "sk_test_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      // Set the new API key for display
      setNewApiKey(mockApiKey)

      // Add the new key to the list (without the actual key value)
      const agent = purchasedAgents.find((a) => a.id === Number.parseInt(selectedAgent))

      if (agent) {
        setApiKeys([
          {
            key_id: Math.floor(Math.random() * 1000),
            agent_id: agent.id,
            agent_name: agent.name,
            key_name: newKeyName || null,
            status: "active",
            created_at: new Date().toISOString(),
            expires_at: null,
            last_used: null,
          },
          ...apiKeys,
        ])
      }

      // Reset form
      setNewKeyName("")
      setSelectedAgent("")

      toast({
        title: "Success",
        description: "API key created successfully",
      })
    } catch (error) {
      console.error("Error creating API key:", error)
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeKey = async (keyId: number) => {
    try {
      setIsLoading(true)

      // In a real implementation, this would be an API call
      // const response = await fetch(`/api/keys/${keyId}/revoke`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // })

      // if (!response.ok) {
      //   throw new Error('Failed to revoke API key')
      // }

      // Update the key status in the list
      setApiKeys(apiKeys.map((key) => (key.key_id === keyId ? { ...key, status: "revoked" } : key)))

      toast({
        title: "Success",
        description: "API key revoked successfully",
      })
    } catch (error) {
      console.error("Error revoking API key:", error)
      toast({
        title: "Error",
        description: "Failed to revoke API key",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRenameKey = async (keyId: number, newName: string) => {
    try {
      setIsLoading(true)

      // In a real implementation, this would be an API call
      // const response = await fetch(`/api/keys/${keyId}/rename`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({ name: newName })
      // })

      // if (!response.ok) {
      //   throw new Error('Failed to rename API key')
      // }

      // Update the key name in the list
      setApiKeys(apiKeys.map((key) => (key.key_id === keyId ? { ...key, key_name: newName } : key)))

      toast({
        title: "Success",
        description: "API key renamed successfully",
      })
    } catch (error) {
      console.error("Error renaming API key:", error)
      toast({
        title: "Error",
        description: "Failed to rename API key",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    })
  }

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">API Keys</h1>
            <p className="text-muted-foreground">Manage API keys for your purchased AI agents</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Create New API Key</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Create an API key to integrate with your purchased AI agent. Keep your API keys secure.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="agent">Select Agent</Label>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger id="agent">
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {purchasedAgents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id.toString()}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name (Optional)</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Production, Development"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateKey} disabled={!selectedAgent || isLoading}>
                  {isLoading ? "Creating..." : "Create API Key"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {newApiKey && (
          <Card className="mb-8 border-green-500">
            <CardHeader>
              <CardTitle className="text-green-600">API Key Created Successfully</CardTitle>
              <CardDescription>
                This is the only time your API key will be displayed. Please copy it now and store it securely.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-md flex items-center justify-between">
                <code className="text-sm font-mono break-all">{newApiKey}</code>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(newApiKey)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-7 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : apiKeys.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {apiKeys.map((key) => (
              <Card key={key.key_id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>{key.key_name || `Unnamed Key (${key.key_id})`}</CardTitle>
                    <CardDescription>{key.agent_name}</CardDescription>
                  </div>
                  <Badge
                    className={key.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {key.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Created</p>
                        <p className="font-medium">{formatDate(key.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Last Used</p>
                        <p className="font-medium">{formatDate(key.last_used)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Expires</p>
                      <p className="font-medium">{key.expires_at ? formatDate(key.expires_at) : "Never"}</p>
                    </div>

                    {key.status === "active" && (
                      <div className="flex space-x-2 pt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Rename
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rename API Key</DialogTitle>
                              <DialogDescription>Enter a new name for your API key.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="newKeyName">Key Name</Label>
                                <Input
                                  id="newKeyName"
                                  placeholder="e.g., Production, Development"
                                  defaultValue={key.key_name || ""}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => {
                                  const input = document.getElementById("newKeyName") as HTMLInputElement
                                  handleRenameKey(key.key_id, input.value)
                                }}
                              >
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Revoke
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to revoke this API key? This action cannot be undone, and any
                                applications using this key will no longer work.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRevokeKey(key.key_id)}>
                                Yes, Revoke Key
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Key className="h-8 w-8 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No API Keys Found</h2>
            <p className="text-muted-foreground mb-6">
              You haven't created any API keys yet. Create a key to start integrating with your purchased AI agents.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create Your First API Key</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Create an API key to integrate with your purchased AI agent. Keep your API keys secure.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent">Select Agent</Label>
                    <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                      <SelectTrigger id="agent">
                        <SelectValue placeholder="Select an agent" />
                      </SelectTrigger>
                      <SelectContent>
                        {purchasedAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keyName">Key Name (Optional)</Label>
                    <Input
                      id="keyName"
                      placeholder="e.g., Production, Development"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateKey} disabled={!selectedAgent || isLoading}>
                    {isLoading ? "Creating..." : "Create API Key"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
