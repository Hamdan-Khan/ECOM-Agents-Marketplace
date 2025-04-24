"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock data for featured agents
// This will be replaced with API calls in the future
const mockFeaturedAgents = [
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
]

export default function FeaturedAgents() {
  const [featuredAgents, setFeaturedAgents] = useState(mockFeaturedAgents)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate API call to fetch featured agents
  useEffect(() => {
    const fetchAgents = async () => {
      // In a real implementation, this would be an API call
      // const response = await fetch('/api/agents/featured')
      // const data = await response.json()
      // setFeaturedAgents(data)

      // For now, we'll use the mock data and simulate a loading delay
      setTimeout(() => {
        setFeaturedAgents(mockFeaturedAgents)
        setIsLoading(false)
      }, 500)
    }

    fetchAgents()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <CardFooter>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {featuredAgents.map((agent) => (
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
  )
}
