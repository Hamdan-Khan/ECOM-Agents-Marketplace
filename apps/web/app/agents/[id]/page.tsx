"use client";

import Footer from "@/components/footer";
import ReviewSection from "@/components/reviews/review-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiGet } from "@/services/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { addItem } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

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

  const isAgentOwned = useMemo(() => {
    if (!agent) {
      return false;
    }
    return user?.owned_agents.find((a) => a.id == agent.id) != null;
  }, [user, agent]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="animate-pulse h-full">
                  <CardHeader>
                    <div className="h-9 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                      <div className="h-20 bg-gray-200 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1">
                <Card className="animate-pulse sticky top-4">
                  <CardHeader>
                    <div className="h-7 bg-gray-200 rounded w-full mb-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-16 bg-gray-200 rounded w-full"></div>
                      <div className="h-10 bg-gray-200 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-8">{error}</div>
          ) : agent ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Main Agent Card */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="border-b">
                    <CardTitle>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <h1 className="text-3xl font-bold">
                            {agent.name || (
                              <span className="text-red-500">[No Name]</span>
                            )}
                          </h1>
                          <Badge className="w-fit" variant="outline">
                            {agent.category || "Unknown"}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold font-mono">
                            ${agent.price ? Number(agent.price).toFixed(2) : "—"}
                          </div>
                          {agent.subscription_price && (
                            <div className="text-sm text-muted-foreground">
                              or ${Number(agent.subscription_price).toFixed(2)}/month
                            </div>
                          )}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {/* Description */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Description</h3>
                        <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                          {agent.description || (
                            <span className="text-red-500">[No Description]</span>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Details</h3>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <dt className="text-sm text-muted-foreground">Created by</dt>
                            <dd className="font-medium">
                              {agent.created_by || (
                                <span className="text-red-500">[Unknown]</span>
                              )}
                            </dd>
                          </div>
                          <div className="space-y-1">
                            <dt className="text-sm text-muted-foreground">Agent ID</dt>
                            <dd className="font-mono text-sm">{agent.id}</dd>
                          </div>
                          <div className="space-y-1">
                            <dt className="text-sm text-muted-foreground">Created</dt>
                            <dd className="font-medium">
                              {agent.created_at
                                ? new Date(agent.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                : "N/A"}
                            </dd>
                          </div>
                          <div className="space-y-1">
                            <dt className="text-sm text-muted-foreground">Last updated</dt>
                            <dd className="font-medium">
                              {agent.updated_at
                                ? new Date(agent.updated_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                : "N/A"}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      {/* Warning for missing fields */}
                      {(!agent.name ||
                        !agent.description ||
                        !agent.price ||
                        !agent.category) && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-800 text-sm">
                            Warning: Some required agent fields are missing or incomplete.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Reviews Section */}
                <ReviewSection agentId={agent.id} />
              </div>

              {/* Purchase Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Purchase Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {isAgentOwned ? (
                        <Button asChild className="w-full h-12 text-lg" variant="default">
                          <Link href="/dashboard/my-agents">Go to my agents</Link>
                        </Button>
                      ) : (
                        <>
                          <Button
                            className="w-full h-12 text-lg"
                            onClick={() => {
                              const result = addItem({
                                id: agent.id,
                                name: agent.name,
                                price: Number(agent.price),
                                purchaseType: "one-time",
                              });

                              if (result.success) {
                                router.push("/cart");
                              } else {
                                toast({
                                  title: "Already in Cart",
                                  variant: "destructive",
                                  description: result.message,
                                });
                              }
                            }}
                          >
                            Buy Now
                          </Button>

                          <Button
                            variant="secondary"
                            className="w-full h-12 text-lg"
                            onClick={() => {
                              const result = addItem({
                                id: agent.id,
                                name: agent.name,
                                price: Number(agent.price),
                                purchaseType: "one-time",
                              });

                              if (result.success) {
                                toast({
                                  title: "Added to Cart",
                                  variant: "default",
                                  description: `${agent.name} added to cart successfully`,
                                });
                              } else {
                                toast({
                                  title: "Already in Cart",
                                  variant: "destructive",
                                  description: result.message,
                                });
                              }
                            }}
                          >
                            Add To Cart
                          </Button>
                        </>
                      )}

                      <Button asChild variant="outline" className="w-full">
                        <Link href="/agents">Back to Catalog</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
