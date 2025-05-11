"use client";

import Footer from "@/components/footer";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const tokenPackages = [
  { id: 1, name: "Starter", tokens: 100, price: 9.99 },
  { id: 2, name: "Pro", tokens: 500, price: 39.99, popular: true },
  { id: 3, name: "Enterprise", tokens: 1000, price: 69.99 },
];

type TokenPurchase = {
  purchase_id: number;
  amount: number;
  tokens: number;
  status: string;
  created_at: string;
};

type TokenUsage = {
  usage_id: number;
  tokens_used: number;
  created_at: string;
  order_id: number;
  agent_name: string;
};

export default function TokensPage() {
  const [selectedPackage, setSelectedPackage] = useState<string>("2");
  const [customTokens, setCustomTokens] = useState<number>(0);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [tokenPurchases, setTokenPurchases] = useState<TokenPurchase[]>([]);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  const router = useRouter();
  const { toast } = useToast();

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));

      // Fetch token balance and history
      fetchTokenData();
    } else {
      toast({
        title: "Authentication required",
        description: "Please sign in to purchase tokens.",
        variant: "destructive",
      });
      router.push("/login?redirect=tokens");
    }
  }, [router, toast]);

  const fetchTokenData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Fetch token balance
      const balanceResponse = await fetch("/api/tokens/balance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setTokenBalance(balanceData.balance);
      }

      // Fetch token history
      const historyResponse = await fetch("/api/tokens/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setTokenPurchases(historyData.purchases);
        setTokenUsage(historyData.usage);
      }
    } catch (error) {
      console.error("Error fetching token data:", error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handlePurchase = async () => {
    setIsLoading(true);

    try {
      // Determine the number of tokens to purchase
      const tokensToAdd = isCustom
        ? customTokens
        : tokenPackages.find((pkg) => pkg.id.toString() === selectedPackage)
            ?.tokens || 0;

      // Determine the price
      const price = isCustom
        ? (customTokens * 0.1).toFixed(2) // $0.10 per token for custom amounts
        : tokenPackages.find((pkg) => pkg.id.toString() === selectedPackage)
            ?.price || 0;

      const response = await fetch("/api/tokens/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          tokens: tokensToAdd,
          price,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to purchase tokens");
      }

      // Update token balance
      setTokenBalance((prev) => prev + tokensToAdd);

      // Refresh token history
      fetchTokenData();

      toast({
        title: "Purchase Successful",
        description: `${tokensToAdd} tokens have been added to your account.`,
      });
    } catch (error: any) {
      toast({
        title: "Purchase Failed",
        description:
          error.message || "An error occurred during token purchase.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Token Management</h1>
        <p className="text-muted-foreground mb-8">
          Purchase tokens to use for AI agent subscriptions and one-time
          purchases.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-3">
            <Tabs defaultValue="purchase">
              <TabsList className="mb-4">
                <TabsTrigger value="purchase">Purchase Tokens</TabsTrigger>
                <TabsTrigger value="history">Transaction History</TabsTrigger>
              </TabsList>

              <TabsContent value="purchase">
                <Card>
                  <CardHeader>
                    <CardTitle>Purchase Tokens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground mb-4">
                        Select a token package or enter a custom amount.
                      </p>
                      <RadioGroup
                        value={isCustom ? "custom" : selectedPackage}
                        onValueChange={(value) => {
                          if (value === "custom") {
                            setIsCustom(true);
                          } else {
                            setIsCustom(false);
                            setSelectedPackage(value);
                          }
                        }}
                        className="space-y-4"
                      >
                        {tokenPackages.map((pkg) => (
                          <div
                            key={pkg.id}
                            className={`relative rounded-lg border p-4 ${pkg.popular ? "border-blue-500" : ""}`}
                          >
                            {pkg.popular && (
                              <div className="absolute -top-3 right-4 bg-blue-500 text-white px-2 py-0.5 text-xs rounded-full">
                                Popular
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={pkg.id.toString()}
                                id={`pkg-${pkg.id}`}
                              />
                              <Label
                                htmlFor={`pkg-${pkg.id}`}
                                className="flex-1"
                              >
                                <div className="font-medium">{pkg.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {pkg.tokens} tokens
                                </div>
                              </Label>
                              <div className="text-right">
                                <div className="font-bold">
                                  ${pkg.price.toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ${(pkg.price / pkg.tokens).toFixed(2)} per
                                  token
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="relative rounded-lg border p-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom" className="flex-1">
                              <div className="font-medium">Custom Amount</div>
                              <div className="mt-2">
                                <Input
                                  type="number"
                                  min="10"
                                  step="10"
                                  placeholder="Enter number of tokens"
                                  value={customTokens || ""}
                                  onChange={(e) =>
                                    setCustomTokens(
                                      Number.parseInt(e.target.value) || 0
                                    )
                                  }
                                  disabled={!isCustom}
                                  className="max-w-xs"
                                />
                              </div>
                            </Label>
                            <div className="text-right">
                              <div className="font-bold">
                                $
                                {isCustom && customTokens
                                  ? (customTokens * 0.1).toFixed(2)
                                  : "0.00"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                $0.10 per token
                              </div>
                            </div>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handlePurchase}
                      disabled={isLoading || (isCustom && customTokens < 10)}
                      className="w-full"
                    >
                      {isLoading ? "Processing..." : "Purchase Tokens"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isHistoryLoading ? (
                      <div className="py-8 text-center">
                        <p>Loading transaction history...</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">
                            Token Purchases
                          </h3>
                          {tokenPurchases.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="text-left border-b">
                                    <th className="pb-2 font-medium">Date</th>
                                    <th className="pb-2 font-medium">Amount</th>
                                    <th className="pb-2 font-medium">Tokens</th>
                                    <th className="pb-2 font-medium">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tokenPurchases.map((purchase) => (
                                    <tr
                                      key={purchase.purchase_id}
                                      className="border-b"
                                    >
                                      <td className="py-3">
                                        {formatDate(purchase.created_at)}
                                      </td>
                                      <td className="py-3">
                                        $
                                        {Number.parseFloat(
                                          purchase.amount.toString()
                                        ).toFixed(2)}
                                      </td>
                                      <td className="py-3">
                                        {purchase.tokens}
                                      </td>
                                      <td className="py-3 capitalize">
                                        {purchase.status}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">
                              No purchase history found.
                            </p>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-2">
                            Token Usage
                          </h3>
                          {tokenUsage.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="text-left border-b">
                                    <th className="pb-2 font-medium">Date</th>
                                    <th className="pb-2 font-medium">Agent</th>
                                    <th className="pb-2 font-medium">
                                      Order ID
                                    </th>
                                    <th className="pb-2 font-medium">
                                      Tokens Used
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tokenUsage.map((usage) => (
                                    <tr
                                      key={usage.usage_id}
                                      className="border-b"
                                    >
                                      <td className="py-3">
                                        {formatDate(usage.created_at)}
                                      </td>
                                      <td className="py-3">
                                        {usage.agent_name}
                                      </td>
                                      <td className="py-3">
                                        #{usage.order_id}
                                      </td>
                                      <td className="py-3">
                                        {usage.tokens_used}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">
                              No usage history found.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Token Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{tokenBalance}</div>
                <p className="text-sm text-muted-foreground">
                  Tokens can be used to purchase AI agents or subscribe to
                  services.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <a href="/dashboard">View Dashboard</a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
