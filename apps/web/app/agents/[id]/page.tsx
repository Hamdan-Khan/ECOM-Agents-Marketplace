"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/contexts/cart-context"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

// Mock data for a single agent
// This will be replaced with API calls in the future
const mockAgentDetails = {
  id: 1,
  name: "TextAnalyzer Pro",
  description: "Advanced NLP tool for sentiment analysis and text classification.",
  category: "NLP",
  price: 49.99,
  subscription_price: 9.99,
  developer_id: 2,
  developer_email: "developer@example.com",
  created_at: "2023-01-15T00:00:00Z",
  long_description: `
    TextAnalyzer Pro is a state-of-the-art natural language processing tool designed for businesses and researchers who need to extract insights from text data.
    
    Key Features:
    - Sentiment Analysis: Determine the emotional tone of text (positive, negative, neutral)
    - Text Classification: Automatically categorize documents into predefined categories
    - Named Entity Recognition: Identify and extract named entities (people, organizations, locations)
    - Keyword Extraction: Identify the most important terms in a document
    - Language Detection: Automatically detect the language of text
    
    Use Cases:
    - Customer Feedback Analysis
    - Social Media Monitoring
    - Content Categorization
    - Research Data Analysis
    
    Integration Options:
    - REST API
    - Python SDK
    - JavaScript Library
    - Webhook Support
  `,
  technical_specs: `
    - API Rate Limit: 1000 requests per day
    - Response Time: < 200ms
    - Supported Languages: English, Spanish, French, German, Chinese
    - Data Privacy: All data is processed securely and not stored
    - Authentication: API Key
    - Output Formats: JSON, CSV
    
    System Requirements:
    - For SDK: Python 3.7+
    - For JS Library: Node.js 14+
  `,
}

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const [agent, setAgent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPurchaseType, setSelectedPurchaseType] = useState("one-time")
  const router = useRouter()
  const { toast } = useToast()
  const { addItem } = useCart()

  // Simulate API call to fetch agent details
  useEffect(() => {
    const fetchAgentDetails = async () => {
      // In a real implementation, this would be an API call
      // const response = await fetch(`/api/agents/${params.id}`)
      // const data = await response.json()
      // setAgent(data)

      // For now, we'll use the mock data and simulate a loading delay
      setTimeout(() => {
        setAgent(mockAgentDetails)
        setIsLoading(false)
      }, 500)
    }

    fetchAgentDetails()
  }, [params.id])

  const handleAddToCart = () => {
    if (!agent) return

    addItem({
      id: agent.id,
      name: agent.name,
      price: selectedPurchaseType === "one-time" ? agent.price : agent.subscription_price,
      purchaseType: selectedPurchaseType as "one-time" | "subscription",
    })

    toast({
      title: "Added to cart",
      description: `${agent.name} has been added to your cart.`,
    })
  }

  const handleBuyNow = () => {
    if (!agent) return

    addItem({
      id: agent.id,
      name: agent.name,
      price: selectedPurchaseType === "one-time" ? agent.price : agent.subscription_price,
      purchaseType: selectedPurchaseType as "one-time" | "subscription",
    })

    router.push("/cart")
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              </div>
              <div>
                <div className="h-40 bg-gray-200 rounded w-full mb-4"></div>
              </div>
            </div>
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
              The agent you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <a href="/agents">Back to Catalog</a>
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
          <div className="flex items-center">
            <Badge variant="outline" className="mr-2">
              {agent.category}
            </Badge>
            <span className="text-sm text-muted-foreground">Developed by {agent.developer_email}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="technical">Technical Specs</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <div className="prose max-w-none">
                  <p className="text-lg mb-4">{agent.description}</p>
                  <div className="whitespace-pre-line">{agent.long_description}</div>
                </div>
              </TabsContent>
              <TabsContent value="technical" className="mt-4">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line">{agent.technical_specs}</div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Purchase Options</h3>
                  <div className="flex border rounded-md overflow-hidden">
                    <button
                      className={`flex-1 py-2 px-4 text-center ${
                        selectedPurchaseType === "one-time"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedPurchaseType("one-time")}
                    >
                      One-time
                    </button>
                    <button
                      className={`flex-1 py-2 px-4 text-center ${
                        selectedPurchaseType === "subscription"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedPurchaseType("subscription")}
                    >
                      Subscription
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-3xl font-bold mb-1">
                    $
                    {selectedPurchaseType === "one-time" ? agent.price.toFixed(2) : agent.subscription_price.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedPurchaseType === "one-time" ? "One-time purchase" : "Per month, billed monthly"}
                  </div>
                </div>

                <div className="space-y-4">
                  <Button className="w-full" onClick={handleAddToCart}>
                    Add to Cart
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleBuyNow}>
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
