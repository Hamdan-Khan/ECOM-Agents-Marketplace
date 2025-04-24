"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Copy, ExternalLink } from "lucide-react"

type Agent = {
  id: number
  name: string
  description: string
  category: string
  integration_type: string
  endpoint_url: string
  documentation_url: string | null
  request_format: any
  response_format: any
}

export default function AgentIntegrationPage({ params }: { params: { id: string } }) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login?redirect=dashboard/integrations")
          return
        }

        // In a real implementation, this would be an API call
        // For now, we'll use mock data
        setTimeout(() => {
          setAgent({
            id: Number.parseInt(params.id),
            name: "TextAnalyzer Pro",
            description: "Advanced NLP tool for sentiment analysis and text classification.",
            category: "NLP",
            integration_type: "REST API",
            endpoint_url: "https://api.aiexchange.com/v1/agents/textanalyzer",
            documentation_url: "https://docs.aiexchange.com/agents/textanalyzer",
            request_format: {
              text: "string",
              options: {
                sentiment: "boolean",
                classification: "boolean",
                entities: "boolean",
              },
            },
            response_format: {
              sentiment: {
                score: "number",
                label: "string",
              },
              classification: {
                categories: "string[]",
                confidence: "number",
              },
              entities: "object[]",
            },
          })
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching agent details:", error)
        toast({
          title: "Error",
          description: "Failed to load agent integration details",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchAgentDetails()
  }, [params.id, router, toast])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Code snippet copied to clipboard",
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Agent not found</h2>
            <p className="text-muted-foreground mb-6">
              The agent you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button asChild>
              <a href="/dashboard">Return to Dashboard</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{agent.name} Integration</h1>
          <div className="flex items-center">
            <Badge variant="outline" className="mr-2">
              {agent.category}
            </Badge>
            <Badge variant="secondary">{agent.integration_type}</Badge>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
            <TabsTrigger value="examples">Code Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Integration Overview</CardTitle>
                <CardDescription>Learn how to integrate with {agent.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p>{agent.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Getting Started</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      Create an API key from the{" "}
                      <a href="/dashboard/api-keys" className="text-blue-600 hover:underline">
                        API Keys
                      </a>{" "}
                      page
                    </li>
                    <li>Use the API key in the Authorization header of your requests</li>
                    <li>Make requests to the endpoint URL with the required parameters</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Resources</h3>
                  {agent.documentation_url && (
                    <Button variant="outline" asChild>
                      <a href={agent.documentation_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Full Documentation
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Reference</CardTitle>
                <CardDescription>Endpoint details and request/response formats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Endpoint</h3>
                  <div className="bg-gray-100 p-4 rounded-md flex items-center justify-between">
                    <code className="text-sm font-mono">{agent.endpoint_url}</code>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(agent.endpoint_url)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Authentication</h3>
                  <p className="mb-2">Include your API key in the request headers:</p>
                  <div className="bg-gray-100 p-4 rounded-md">
                    <code className="text-sm font-mono">Authorization: Bearer YOUR_API_KEY</code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Request Format</h3>
                  <div className="bg-gray-100 p-4 rounded-md flex items-center justify-between">
                    <pre className="text-sm font-mono overflow-auto">
                      {JSON.stringify(agent.request_format, null, 2)}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(agent.request_format, null, 2))}
                      className="ml-4"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Response Format</h3>
                  <div className="bg-gray-100 p-4 rounded-md flex items-center justify-between">
                    <pre className="text-sm font-mono overflow-auto">
                      {JSON.stringify(agent.response_format, null, 2)}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(agent.response_format, null, 2))}
                      className="ml-4"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples">
            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
                <CardDescription>Sample code to help you get started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">JavaScript / Node.js</h3>
                  <div className="bg-gray-100 p-4 rounded-md relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(`const fetch = require('node-fetch');

async function analyzeText(text) {
  const response = await fetch('${agent.endpoint_url}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      text: text,
      options: {
        sentiment: true,
        classification: true,
        entities: false
      }
    })
  });

  return await response.json();
}

// Example usage
analyzeText('I love this product! It works great.')
  .then(result => console.log(result))
  .catch(error => console.error('Error:', error));`)
                      }
                      className="absolute top-2 right-2"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <pre className="text-sm font-mono overflow-auto">
                      {`const fetch = require('node-fetch');

async function analyzeText(text) {
  const response = await fetch('${agent.endpoint_url}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      text: text,
      options: {
        sentiment: true,
        classification: true,
        entities: false
      }
    })
  });

  return await response.json();
}

// Example usage
analyzeText('I love this product! It works great.')
  .then(result => console.log(result))
  .catch(error => console.error('Error:', error));`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Python</h3>
                  <div className="bg-gray-100 p-4 rounded-md relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(`import requests

def analyze_text(text, api_key):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    payload = {
        'text': text,
        'options': {
            'sentiment': True,
            'classification': True,
            'entities': False
        }
    }
    
    response = requests.post('${agent.endpoint_url}', json=payload, headers=headers)
    return response.json()

# Example usage
api_key = 'YOUR_API_KEY'
result = analyze_text('I love this product! It works great.', api_key)
print(result)`)
                      }
                      className="absolute top-2 right-2"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <pre className="text-sm font-mono overflow-auto">
                      {`import requests

def analyze_text(text, api_key):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    payload = {
        'text': text,
        'options': {
            'sentiment': True,
            'classification': True,
            'entities': False
        }
    }
    
    response = requests.post('${agent.endpoint_url}', json=payload, headers=headers)
    return response.json()

# Example usage
api_key = 'YOUR_API_KEY'
result = analyze_text('I love this product! It works great.', api_key)
print(result)`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
