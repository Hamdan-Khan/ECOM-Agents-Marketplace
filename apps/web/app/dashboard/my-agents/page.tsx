"use client";

import { DashboardLayout } from "@/components/dashboard/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Order {
  id: string;
  agent: Agent;
  type: 'one-time' | 'subscription';
  created_at: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  subscription_price?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function MyAgentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPurchasedAgents();
    }
  }, [user]);

  const fetchPurchasedAgents = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // Get all orders for the current user
      const ordersResponse = await apiGet<{ 
        items: Array<{ agent: Agent; type: 'one-time' | 'subscription' }>
      }>(`/orders?userId=${user.id}`);

      

      // Extract unique agents from the orders
      const uniqueAgents = new Map<string, Agent>();
      ordersResponse.items?.forEach(order => {
        if (order.agent) {
          uniqueAgents.set(order.agent.id, order.agent);
        }
      });

      setAgents(Array.from(uniqueAgents.values()));
    } catch (error: any) {
      console.error('Error fetching agents:', error);
      if (error.status === 401) {
        router.push("/login");
      } else {
        toast({
          variant: "destructive",
          title: "Error", 
          description: error.message || "Failed to fetch your agents"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (agent: Agent) => {
    if (!window.confirm(`Are you sure you want to delete "${agent.name}"?`))
      return;

    try {
      setDeletingAgentId(agent.id);
      await apiPost(`/agents/${agent.id}`, {}, { method: "DELETE" });
      toast({
        title: "Success",
        description: "Agent deleted successfully"
      });
      await fetchPurchasedAgents();
    } catch (error: any) {
      if (error.status === 401) {
        router.push("/login");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to delete agent"
        });
      }
    } finally {
      setDeletingAgentId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Purchased Agents</h1>
      </div>

      {user.owned_agents.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Agents Found</CardTitle>
            <CardDescription>
              You haven't purchased any agents yet. Browse our marketplace to find AI agents.
            </CardDescription>
            <Link href="/agents">
              <Button>Browse Agents</Button>
            </Link>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {user.owned_agents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>{agent.name}</CardTitle>
                </div>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{agent.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    Created {format(new Date(agent.created_at), "MMM d, yyyy")}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {agent.description}
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <div>
                    <span className="font-medium">Price:</span> $
                    {parseInt(agent.price).toFixed(2)}
                  </div>
                  {agent.subscription_price &&
                    parseInt(agent.subscription_price) > 0 && (
                      <div>
                        <span className="font-medium">Subscription:</span> $
                        {parseInt(agent.subscription_price).toFixed(2)}/month
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
