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
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { apiGet } from "@/services/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { addItem } = useCart();
  const router = useRouter();
  const { toast } = useToast();

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
                  <CardTitle className="text-2xl font-bold mb-1 flex items-center gap-2">
                    {agent.name || (
                      <span className="text-red-500">[No Name]</span>
                    )}
                    <Badge variant="outline">
                      {agent.category || "Unknown"}
                    </Badge>
                  </CardTitle>
                  <div className="text-xs text-gray-400">
                    Agent ID: {agent.id}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="font-semibold mb-1">Description</div>
                    <p className="text-gray-700 whitespace-pre-line">
                      {agent.description || (
                        <span className="text-red-500">[No Description]</span>
                      )}
                    </p>
                  </div>
                  <div className="mb-4 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Price:</span>
                      <span className="font-mono">
                        $
                        {agent.price ? (
                          Number(agent.price).toFixed(2)
                        ) : (
                          <span className="text-red-500">[Missing]</span>
                        )}
                      </span>
                      {agent.subscription_price && (
                        <span className="ml-2 text-xs text-gray-500">
                          or ${Number(agent.subscription_price).toFixed(2)}/mo
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Created by:</span>{" "}
                    <span className="font-mono">
                      {agent.created_by || (
                        <span className="text-red-500">[Unknown]</span>
                      )}
                    </span>
                  </div>
                  <div className="mb-2 text-xs text-gray-400">
                    <span className="font-semibold">Created:</span>{" "}
                    {agent.created_at
                      ? new Date(agent.created_at).toLocaleString()
                      : "N/A"}
                  </div>
                  <div className="mb-2 text-xs text-gray-400">
                    <span className="font-semibold">Last updated:</span>{" "}
                    {agent.updated_at
                      ? new Date(agent.updated_at).toLocaleString()
                      : "N/A"}
                  </div>
                  {/* Warning for missing required fields */}
                  {(!agent.name ||
                    !agent.description ||
                    !agent.price ||
                    !agent.category) && (
                    <div className="mt-4 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
                      Warning: Some required agent fields are missing or
                      incomplete.
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <div className="w-full flex justify-between">
                    <Button
                      className="w-[48%]"
                      onClick={() => {
                        addItem({
                          id: agent.id,
                          name: agent.name,
                          price: Number(agent.price),
                          purchaseType: "one-time",
                        });
                        toast({
                          title: "Added to Cart",
                          variant: "default",
                          description: `${agent.name} Added to Card Succesfully`,
                        });
                      }}
                    >
                      Add To Cart
                    </Button>
                    <Button
                      className="w-[48%]"
                      onClick={() => {
                        addItem({
                          id: agent.id,
                          name: agent.name,
                          price: Number(agent.price),
                          purchaseType: "one-time",
                        });
                        router.push("/cart");
                      }}
                    >
                      Buy Now
                    </Button>
                  </div>
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
