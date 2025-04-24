"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

// Mock data for agents
// This will be replaced with API calls in the future
const mockAgents = [
  {
    id: 1,
    name: "TextAnalyzer Pro",
    description: "Advanced NLP tool for sentiment analysis and text classification.",
    category: "NLP",
    price: 49.99,
    subscription_price: 9.99,
  },
  {
    id: 2,
    name: "ImageVision AI",
    description: "Computer vision tool for object detection and image classification.",
    category: "Computer Vision",
    price: 79.99,
    subscription_price: 14.99,
  },
  {
    id: 3,
    name: "DataPredictor",
    description: "Predictive analytics tool for forecasting business metrics.",
    category: "Predictive Analytics",
    price: 99.99,
    subscription_price: 19.99,
  },
  {
    id: 4,
    name: "VoiceAssistant",
    description: "Speech recognition and voice command processing tool.",
    category: "Speech Recognition",
    price: 59.99,
    subscription_price: 11.99,
  },
  {
    id: 5,
    name: "RecommendationEngine",
    description: "AI-powered recommendation system for e-commerce and content platforms.",
    category: "Recommendation Systems",
    price: 89.99,
    subscription_price: 16.99,
  },
  {
    id: 6,
    name: "ChatbotBuilder",
    description: "Platform for creating and deploying AI chatbots for customer service.",
    category: "Conversational AI",
    price: 69.99,
    subscription_price: 12.99,
  },
]

const categories = [
  "All Categories",
  "NLP",
  "Computer Vision",
  "Predictive Analytics",
  "Speech Recognition",
  "Recommendation Systems",
  "Conversational AI",
]

export default function AgentsPage() {
  const [agents, setAgents] = useState(mockAgents)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })

  // Simulate API call to fetch agents
  useEffect(() => {
    const fetchAgents = async () => {
      // In a real implementation, this would be an API call
      // const response = await fetch('/api/agents')
      // const data = await response.json()
      // setAgents(data)

      // For now, we'll use the mock data and simulate a loading delay
      setTimeout(() => {
        setAgents(mockAgents)
        setIsLoading(false)
      }, 500)
    }

    fetchAgents()
  }, [])

  // Filter agents based on search, category, and price
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "All Categories" || agent.category === selectedCategory

    const matchesPrice = agent.price >= priceRange.min && agent.price <= priceRange.max

    return matchesSearch && matchesCategory && matchesPrice
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">AI Agents Catalog</h1>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search */}
              <div>
                <Label htmlFor="search" className="mb-2 block">
                  Search
                </Label>
                <Input
                  id="search"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div>
                <Label htmlFor="category" className="mb-2 block">
                  Category
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <Label className="mb-2 block">Price Range</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    className="w-full"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-7 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <Card key={agent.id}>
                  <CardHeader>
                    <CardTitle>{agent.name}</CardTitle>
                    <Badge variant="outline">{agent.category}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{agent.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">${agent.price.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">or ${agent.subscription_price.toFixed(2)}/month</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/agents/${agent.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No agents found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
