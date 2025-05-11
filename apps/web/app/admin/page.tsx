"use client";

import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiGet } from "@/services/api";
import { Bot, CreditCard, ShoppingCart, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface AdminStats {
  totalUsers: number;
  totalAgents: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAgents: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch all required data in parallel
        const [usersData, agentsData, ordersData] = await Promise.all([
          apiGet<{ total: number }>("/users"),
          apiGet<{ total: number }>("/agents"),
          apiGet<{ total: number; items: any[] }>("/orders"),
        ]);

        // Calculate total revenue from payments
        const totalRevenue = ordersData.items.reduce((sum, orders) => {
          return sum + (Number(orders.price) || 0);
        }, 0);

        setStats({
          totalUsers: usersData.total || 0,
          totalAgents: agentsData.total || 0,
          totalOrders: ordersData.total || 0,
          totalRevenue,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch admin stats",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Overview</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Agents
              </CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAgents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

// TODO: Add server-side admin route protection (middleware or getServerSideProps) to block non-admins from accessing /admin even if they bypass client-side checks.
