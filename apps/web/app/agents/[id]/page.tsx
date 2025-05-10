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
import { apiGet } from "@/services/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError("");
    apiGet<any>(`/agents/${id}`)
      .then((data) => {
        setAgent(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Failed to load agent details.");
        setIsLoading(false);
      });
  }, [id]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="max-w-xl mx-auto">
              <Card className="animate-pulse">
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
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-8">{error}</div>
          ) : agent ? (
            <div className="max-w-xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>{agent.name}</CardTitle>
                  <Badge>{agent.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-gray-700">{agent.description}</p>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="font-semibold text-lg">
                      ${Number(agent.price).toFixed(2)}
                    </span>
                    {agent.subscription_price && (
                      <span className="text-xs text-gray-500">
                        or ${Number(agent.subscription_price).toFixed(2)}/mo
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    Created by:{" "}
                    {agent.created_by?.name ||
                      agent.created_by?.email ||
                      "Unknown"}
                  </div>
                  <div className="text-xs text-gray-400">
                    Last updated:{" "}
                    {agent.updated_at
                      ? new Date(agent.updated_at).toLocaleString()
                      : "N/A"}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link href={`"/checkout?agentId=${agent.id}"`}>
                      Buy Now
                    </Link>
                  </Button>
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/agents">Back to Catalog</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
