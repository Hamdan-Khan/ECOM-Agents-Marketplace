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
import { apiGet } from "@/services/api";
import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [owned, setOwned] = useState<any[]>([]);
  const { login } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      const data: any = await apiGet("/users/profile");
      const token = localStorage.getItem("token");
      login(data, token!);
      setOwned(data.owned_agents);
    };
    fetchUser();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Purchased Agents</h1>
      </div>

      {owned.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Agents Found</CardTitle>
            <CardDescription>
              You haven't purchased any agents yet. Browse our marketplace to
              find AI agents.
            </CardDescription>
            <Link href="/agents">
              <Button>Browse Agents</Button>
            </Link>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {owned.map((agent) => (
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
