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

  if (!user) {
    return (
      <div className="h-40 flex items-center justify-center">
        You must be logged in
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Agents</h1>
        {isAdmin && (
          <Button onClick={() => router.push("/dashboard/create-agent")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        )}
      </div>

      {user.owned_agents.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Agents Found</CardTitle>
            <CardDescription>
              You don't own any agents yet. Click this button to browse and buy
              your first agent.
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
