"use client";

import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiGet } from "@/services/api";
import Link from "next/link";
import { useEffect, useState } from "react";

const categories = [
  "All Categories",
  "NLP",
  "COMPUTER_VISION",
  "ANALYTICS",
  "BOTS",
  "WORKFLOW_HELPERS",
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  useEffect(() => {
    setIsLoading(true);
    setError("");
    apiGet<any>("/agents")
      .then((data) => {
        setAgents(data.items || []);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Failed to load agents.");
        setIsLoading(false);
      });
  }, []);

  // Filter agents based on search, category, and price
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Categories" ||
      agent.category === selectedCategory;

    const matchesPrice =
      Number(agent.price) >= priceRange.min &&
      Number(agent.price) <= priceRange.max;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="flex flex-col min-h-screen">
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
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replaceAll("_", " ")}
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
                    onChange={(e) =>
                      setPriceRange({
                        ...priceRange,
                        min: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({
                        ...priceRange,
                        max: Number(e.target.value),
                      })
                    }
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
          ) : error ? (
            <div className="text-red-600 text-center py-8">{error}</div>
          ) : filteredAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <Card key={agent.id}>
                  <CardHeader>
                    <CardTitle>{agent.name}</CardTitle>
                    <Badge className="max-w-max">
                      {agent.category.replaceAll("_", " ")}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2 text-gray-700">{agent.description}</p>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">
                        ${Number(agent.price).toFixed(2)}
                      </span>
                      {agent.subscription_price && (
                        <span className="text-xs text-gray-500">
                          or ${Number(agent.subscription_price).toFixed(2)}/mo
                        </span>
                      )}
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
            <div className="text-center py-8 text-gray-500">
              No agents found.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
