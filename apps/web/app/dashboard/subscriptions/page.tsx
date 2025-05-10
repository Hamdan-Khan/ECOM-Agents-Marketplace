"use client";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useEffect, useState } from "react";

type Subscription = {
  subscription_id: number;
  agent_id: number;
  agent_name: string;
  status: "active" | "paused" | "cancelled";
  next_billing_date: string;
  payment_method: "gateway" | "tokens";
  price: number;
  created_at: string;
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication required");
        }

        // In a real implementation, this would be an API call
        // const response = await fetch('/api/subscriptions', {
        //   headers: {
        //     'Authorization': `Bearer ${token}`
        //   }
        // })

        // if (!response.ok) {
        //   throw new Error('Failed to fetch subscriptions')
        // }

        // const data = await response.json()
        // setSubscriptions(data)

        // For now, we'll use mock data
        setTimeout(() => {
          setSubscriptions([
            {
              subscription_id: 1,
              agent_id: 2,
              agent_name: "ImageVision AI",
              status: "active",
              next_billing_date: "2023-08-22",
              payment_method: "gateway",
              price: 14.99,
              created_at: "2023-07-22",
            },
            {
              subscription_id: 2,
              agent_id: 3,
              agent_name: "DataPredictor",
              status: "active",
              next_billing_date: "2023-08-15",
              payment_method: "tokens",
              price: 19.99,
              created_at: "2023-07-15",
            },
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load subscriptions",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [toast]);

  const handleCancelSubscription = async (subscriptionId: number) => {
    try {
      // In a real implementation, this would be an API call
      // const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // })

      // if (!response.ok) {
      //   throw new Error('Failed to cancel subscription')
      // }

      // Update local state
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.subscription_id === subscriptionId
            ? { ...sub, status: "cancelled" }
            : sub
        )
      );

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };

  const handlePauseSubscription = async (
    subscriptionId: number,
    currentStatus: string
  ) => {
    try {
      const newStatus = currentStatus === "paused" ? "active" : "paused";

      // In a real implementation, this would be an API call
      // const response = await fetch(`/api/subscriptions/${subscriptionId}/status`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({ status: newStatus })
      // })

      // if (!response.ok) {
      //   throw new Error(`Failed to ${newStatus === 'paused' ? 'pause' : 'resume'} subscription`)
      // }

      // Update local state
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.subscription_id === subscriptionId
            ? { ...sub, status: newStatus as "active" | "paused" | "cancelled" }
            : sub
        )
      );

      toast({
        title:
          newStatus === "paused"
            ? "Subscription Paused"
            : "Subscription Resumed",
        description:
          newStatus === "paused"
            ? "Your subscription has been paused. You can resume it anytime."
            : "Your subscription has been resumed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Subscriptions</h1>
            <p className="text-muted-foreground">
              Manage your active subscriptions
            </p>
          </div>
          <Button asChild>
            <Link href="/agents">Browse More Agents</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6">
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
              </Card>
            ))}
          </div>
        ) : subscriptions.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {subscriptions.map((subscription) => (
              <Card key={subscription.subscription_id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>{subscription.agent_name}</CardTitle>
                    <CardDescription>
                      Subscribed on {formatDate(subscription.created_at)}
                    </CardDescription>
                  </div>
                  <Badge
                    className={
                      subscription.status === "active"
                        ? "bg-green-100 text-green-800"
                        : subscription.status === "paused"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {subscription.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Next Billing Date
                        </p>
                        <p className="font-medium">
                          {subscription.status === "cancelled"
                            ? "No future billing"
                            : formatDate(subscription.next_billing_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Payment Method
                        </p>
                        <p className="font-medium capitalize">
                          {subscription.payment_method === "gateway"
                            ? "Credit Card"
                            : "Tokens"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Monthly Price
                      </p>
                      <p className="font-medium">
                        ${subscription.price.toFixed(2)}
                      </p>
                    </div>

                    {subscription.status !== "cancelled" && (
                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            handlePauseSubscription(
                              subscription.subscription_id,
                              subscription.status
                            )
                          }
                        >
                          {subscription.status === "paused"
                            ? "Resume"
                            : "Pause"}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                              Cancel Subscription
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Cancel Subscription
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel your
                                subscription to {subscription.agent_name}? You
                                will lose access at the end of your current
                                billing period.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                Keep Subscription
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleCancelSubscription(
                                    subscription.subscription_id
                                  )
                                }
                              >
                                Yes, Cancel
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">No active subscriptions</h2>
            <p className="text-muted-foreground mb-6">
              You don't have any active subscriptions. Browse our AI agents to
              find tools that can help you.
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
