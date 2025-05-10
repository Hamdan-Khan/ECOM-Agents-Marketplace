"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { apiGet, apiPost } from "@/services/api"
import { format } from "date-fns"
import { Copy, Loader2, Plus, Trash2 } from "lucide-react"

interface ApiKey {
  id: string
  name: string
  key: string
  created_at: string
  last_used?: string
}

export default function ApiKeysPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [newKeyName, setNewKeyName] = useState("")
  const [creatingKey, setCreatingKey] = useState(false)
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null)

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      setLoading(true)
      const response = await apiGet<{ items: ApiKey[] }>("/api-keys")
      setApiKeys(response.items || [])
    } catch (error: any) {
      if (error.status === 401) {
        router.push("/login")
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch API keys",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the API key",
        variant: "destructive"
      })
      return
    }

    try {
      setCreatingKey(true)
      const response = await apiPost<ApiKey>("/api-keys", { name: newKeyName })
      setApiKeys([response, ...apiKeys])
      setNewKeyName("")
      toast({
        title: "Success",
        description: "API key created successfully"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create API key",
        variant: "destructive"
      })
    } finally {
      setCreatingKey(false)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    try {
      setDeletingKeyId(keyId)
      await apiPost(`/api-keys/${keyId}`, {}, { method: "DELETE" })
      setApiKeys(apiKeys.filter(key => key.id !== keyId))
      toast({
        title: "Success",
        description: "API key deleted successfully"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete API key",
        variant: "destructive"
      })
    } finally {
      setDeletingKeyId(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "API key copied to clipboard"
    })
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">API Keys</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New API Key</CardTitle>
          <CardDescription>
            Generate an API key to access the AI Exchange API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter key name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
            <Button onClick={createApiKey} disabled={creatingKey}>
              {creatingKey ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Generate Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
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
      ) : apiKeys.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No API Keys</CardTitle>
            <CardDescription>
              You haven't created any API keys yet. Create one to get started.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <Card key={key.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{key.name}</CardTitle>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteApiKey(key.id)}
                    disabled={deletingKeyId === key.id}
                  >
                    {deletingKeyId === key.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete
                  </Button>
                </div>
                <CardDescription>
                  Created on {format(new Date(key.created_at), 'MMM d, yyyy')}
                  {key.last_used && (
                    <> · Last used {format(new Date(key.last_used), 'MMM d, yyyy')}</>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                  <code className="text-sm">{key.key}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(key.key)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
