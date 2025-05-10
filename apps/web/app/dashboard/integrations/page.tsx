"use client";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useEffect, useState } from "react";

type Agent = {
  id: number;
  name: string;
  description: string;
  category: string;
  integration_type: string;
  has_api_key: boolean;
};

export default function IntegrationsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        // In a real implementation, this would be an API call
        // For now, we'll use mock data
        setTimeout(() => {
          setAgents([
            {
              id: 1,
              name: "TextAnalyzer Pro",
              description:
                "Advanced NLP tool for sentiment analysis and text classification.",
              category: "NLP",
              integration_type: "REST API",
              has_api_key: true,
            },
            {
              id: 3,
              name: "DataPredictor",
              description:
                "Predictive analytics tool for forecasting business metrics.",
              category: "Predictive Analytics",
              integration_type: "REST API",
              has_api_key: false,
            },
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching agents:", error);
        toast({
          title: "Error",
          description: "Failed to load integrations",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Integrations</h1>
            <p className="text-muted-foreground">
              Integrate your purchased AI agents into your applications
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/api-keys">Manage API Keys</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((i) => (
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
        ) : agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <CardTitle>{agent.name}</CardTitle>
                  <div className="flex space-x-2 mt-1">
                    <Badge variant="outline">{agent.category}</Badge>
                    <Badge variant="secondary">{agent.integration_type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{agent.description}</p>
                  {!agent.has_api_key && (
                    <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                      You need to create an API key to use this integration.
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/integrations/${agent.id}`}>
                      View Documentation
                    </Link>
                  </Button>
                  {!agent.has_api_key && (
                    <Button asChild>
                      <Link href="/dashboard/api-keys">Create API Key</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">
              No integrations available
            </h2>
            <p className="text-muted-foreground mb-6">
              You haven't purchased any AI agents yet. Browse our catalog to
              find agents you can integrate with.
            </p>
            <Button asChild>
              <Link href="/agents">Browse AI Agents</Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
