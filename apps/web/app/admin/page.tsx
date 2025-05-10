"use client";

import type React from "react";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost } from "@/services/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [errorUsers, setErrorUsers] = useState("");
  const [errorAgents, setErrorAgents] = useState("");
  const [errorOrders, setErrorOrders] = useState("");
  const [errorPayments, setErrorPayments] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    subscription_price: "",
  });
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [editAgent, setEditAgent] = useState<any | null>(null);
  const [editAgentForm, setEditAgentForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    subscription_price: "",
  });
  const [editingAgent, setEditingAgent] = useState(false);
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);
  const [userSearch, setUserSearch] = useState("");
  const [agentPage, setAgentPage] = useState(1);
  const [agentPageSize, setAgentPageSize] = useState(10);
  const [agentSearch, setAgentSearch] = useState("");
  const [orderPage, setOrderPage] = useState(1);
  const [orderPageSize, setOrderPageSize] = useState(10);
  const [orderSearch, setOrderSearch] = useState("");
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentPageSize, setPaymentPageSize] = useState(10);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: "",
    email: "",
    role: "USER",
    token_balance: "",
  });
  const [editingUser, setEditingUser] = useState(false);
  const [viewOrder, setViewOrder] = useState<any | null>(null);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [errorOrderDetails, setErrorOrderDetails] = useState("");
  const [viewPayment, setViewPayment] = useState<any | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null);
  const [loadingPaymentDetails, setLoadingPaymentDetails] = useState(false);
  const [errorPaymentDetails, setErrorPaymentDetails] = useState("");

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      setIsLoading(true);
      try {
        const profile = await apiGet<any>("/users/profile");
        setUser(profile);
        if (profile.role !== "ADMIN") {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }
        setIsAdmin(true);
        // Fetch all users
        setLoadingUsers(true);
        try {
          const usersRes = await apiGet<any>("/users");
          setUsers(usersRes.items || []);
          setErrorUsers("");
        } catch (e: any) {
          setErrorUsers(e.message || "Failed to fetch users");
        } finally {
          setLoadingUsers(false);
        }
        // Fetch all agents
        setLoadingAgents(true);
        try {
          const agentsRes = await apiGet<any>("/agents");
          setAgents(agentsRes.items || []);
          setErrorAgents("");
        } catch (e: any) {
          setErrorAgents(e.message || "Failed to fetch agents");
        } finally {
          setLoadingAgents(false);
        }
        // Fetch all orders
        setLoadingOrders(true);
        try {
          const ordersRes = await apiGet<any>("/orders");
          setOrders(ordersRes.items || []);
          setErrorOrders("");
        } catch (e: any) {
          setErrorOrders(e.message || "Failed to fetch orders");
        } finally {
          setLoadingOrders(false);
        }
        // Fetch all payments
        setLoadingPayments(true);
        try {
          const paymentsRes = await apiGet<any>("/payments");
          setPayments(paymentsRes || []);
          setErrorPayments("");
        } catch (e: any) {
          setErrorPayments(e.message || "Failed to fetch payments");
        } finally {
          setLoadingPayments(false);
        }
      } catch (e: any) {
        setUser(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAdminAndFetch();
  }, []);

  const handleNewAgentChange = (field: string, value: string) => {
    setNewAgent({ ...newAgent, [field]: value });
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newAgent.name ||
      !newAgent.description ||
      !newAgent.category ||
      !newAgent.price
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    setCreatingAgent(true);
    try {
      await apiPost("/agents", {
        name: newAgent.name,
        description: newAgent.description,
        category: newAgent.category,
        price: parseFloat(newAgent.price),
        subscription_price: newAgent.subscription_price
          ? parseFloat(newAgent.subscription_price)
          : undefined,
      });
      toast({
        title: "Agent Created",
        description: `${newAgent.name} has been created.`,
      });
      setNewAgent({
        name: "",
        description: "",
        category: "",
        price: "",
        subscription_price: "",
      });
      // Refresh agent list
      setLoadingAgents(true);
      const agentsRes = await apiGet<any>("/agents");
      setAgents(agentsRes.items || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to create agent.",
        variant: "destructive",
      });
    } finally {
      setCreatingAgent(false);
      setLoadingAgents(false);
    }
  };

  const openEditAgent = (agent: any) => {
    setEditAgent(agent);
    setEditAgentForm({
      name: agent.name || "",
      description: agent.description || "",
      category: agent.category || "",
      price: agent.price?.toString() || "",
      subscription_price: agent.subscription_price?.toString() || "",
    });
  };

  const closeEditAgent = () => {
    setEditAgent(null);
  };

  const handleEditAgentChange = (field: string, value: string) => {
    setEditAgentForm({ ...editAgentForm, [field]: value });
  };

  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAgent) return;
    if (
      !editAgentForm.name ||
      !editAgentForm.description ||
      !editAgentForm.category ||
      !editAgentForm.price
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    setEditingAgent(true);
    try {
      await apiPost(
        `/agents/${editAgent.id}`,
        {
          name: editAgentForm.name,
          description: editAgentForm.description,
          category: editAgentForm.category,
          price: parseFloat(editAgentForm.price),
          subscription_price: editAgentForm.subscription_price
            ? parseFloat(editAgentForm.subscription_price)
            : undefined,
        },
        { method: "PATCH" }
      );
      toast({
        title: "Agent Updated",
        description: `${editAgentForm.name} has been updated.`,
      });
      // Refresh agent list
      setLoadingAgents(true);
      const agentsRes = await apiGet<any>("/agents");
      setAgents(agentsRes.items || []);
      closeEditAgent();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to update agent.",
        variant: "destructive",
      });
    } finally {
      setEditingAgent(false);
      setLoadingAgents(false);
    }
  };

  const handleDeleteAgent = async (agent: any) => {
    if (
      !window.confirm(
        `Are you sure you want to delete agent \"${agent.name}\"? This action cannot be undone.`
      )
    )
      return;
    setDeletingAgentId(agent.id);
    try {
      await apiPost(`/agents/${agent.id}`, {}, { method: "DELETE" });
      toast({
        title: "Agent Deleted",
        description: `${agent.name} has been deleted.`,
      });
      // Refresh agent list
      setLoadingAgents(true);
      const agentsRes = await apiGet<any>("/agents");
      setAgents(agentsRes.items || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to delete agent.",
        variant: "destructive",
      });
    } finally {
      setDeletingAgentId(null);
      setLoadingAgents(false);
    }
  };

  const openEditUser = (user: any) => {
    setEditUser(user);
    setEditUserForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "USER",
      token_balance: user.token_balance?.toString() || "",
    });
  };

  const closeEditUser = () => {
    setEditUser(null);
  };

  const handleEditUserChange = (field: string, value: string) => {
    setEditUserForm({ ...editUserForm, [field]: value });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    if (!editUserForm.name || !editUserForm.email || !editUserForm.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    setEditingUser(true);
    try {
      await apiPost(
        `/users/${editUser.id}`,
        {
          name: editUserForm.name,
          email: editUserForm.email,
          role: editUserForm.role,
          token_balance: parseFloat(editUserForm.token_balance),
        },
        { method: "PATCH" }
      );
      toast({
        title: "User Updated",
        description: `${editUserForm.name} has been updated.`,
      });
      // Refresh user list
      setLoadingUsers(true);
      const usersRes = await apiGet<any>("/users");
      setUsers(usersRes.items || []);
      closeEditUser();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to update user.",
        variant: "destructive",
      });
    } finally {
      setEditingUser(false);
      setLoadingUsers(false);
    }
  };

  const handleViewOrder = async (order: any) => {
    setViewOrder(order);
    setOrderDetails(null);
    setErrorOrderDetails("");
    setLoadingOrderDetails(true);
    try {
      const details = await apiGet<any>(`/orders/${order.id}`);
      setOrderDetails(details);
    } catch (e: any) {
      setErrorOrderDetails(e.message || "Failed to fetch order details");
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const closeViewOrder = () => {
    setViewOrder(null);
    setOrderDetails(null);
    setErrorOrderDetails("");
  };

  const handleViewPayment = async (payment: any) => {
    setViewPayment(payment);
    setPaymentDetails(null);
    setErrorPaymentDetails("");
    setLoadingPaymentDetails(true);
    try {
      const details = await apiGet<any>(`/payments/${payment.id}`);
      setPaymentDetails(details);
    } catch (e: any) {
      setErrorPaymentDetails(e.message || "Failed to fetch payment details");
    } finally {
      setLoadingPaymentDetails(false);
    }
  };

  const closeViewPayment = () => {
    setViewPayment(null);
    setPaymentDetails(null);
    setErrorPaymentDetails("");
  };

  // Filter and paginate users
  const filteredUsers = users.filter(
    (u: any) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const pagedUsers = filteredUsers.slice(
    (userPage - 1) * userPageSize,
    userPage * userPageSize
  );

  // Filter and paginate agents
  const filteredAgents = agents.filter(
    (a: any) =>
      a.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
      a.category.toLowerCase().includes(agentSearch.toLowerCase())
  );
  const pagedAgents = filteredAgents.slice(
    (agentPage - 1) * agentPageSize,
    agentPage * agentPageSize
  );

  // Filter and paginate orders
  const filteredOrders = orders.filter(
    (o: any) =>
      o.id.toString().includes(orderSearch) ||
      o.user_id?.toString().includes(orderSearch) ||
      o.agent_id?.toString().includes(orderSearch)
  );
  const pagedOrders = filteredOrders.slice(
    (orderPage - 1) * orderPageSize,
    orderPage * orderPageSize
  );

  // Filter and paginate payments
  const filteredPayments = payments.filter(
    (p: any) =>
      p.id.toString().includes(paymentSearch) ||
      p.order_id?.toString().includes(paymentSearch)
  );
  const pagedPayments = filteredPayments.slice(
    (paymentPage - 1) * paymentPageSize,
    paymentPage * paymentPageSize
  );

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access the admin panel.
            </p>
            <Button asChild>
              <a href="/">Return to Home</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>All registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-2">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="border rounded px-2 py-1 mr-2"
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {filteredUsers.length} users
                  </span>
                </div>
                {loadingUsers ? (
                  <div>Loading users...</div>
                ) : errorUsers ? (
                  <div className="text-red-600">{errorUsers}</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    No users found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-2 font-medium">ID</th>
                          <th className="pb-2 font-medium">Name</th>
                          <th className="pb-2 font-medium">Email</th>
                          <th className="pb-2 font-medium">Role</th>
                          <th className="pb-2 font-medium">Token Balance</th>
                          <th className="pb-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedUsers.map((u: any) => (
                          <tr key={u.id} className="border-b">
                            <td className="py-3">{u.id}</td>
                            <td className="py-3">{u.name}</td>
                            <td className="py-3">{u.email}</td>
                            <td className="py-3">{u.role}</td>
                            <td className="py-3">{u.token_balance}</td>
                            <td className="py-3">
                              <Dialog
                                open={!!editUser}
                                onOpenChange={(v) => {
                                  if (!v) closeEditUser();
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditUser(u)}
                                  >
                                    Edit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit User</DialogTitle>
                                    <DialogDescription>
                                      Update user details
                                    </DialogDescription>
                                  </DialogHeader>
                                  <form
                                    onSubmit={handleUpdateUser}
                                    className="space-y-4"
                                  >
                                    <div>
                                      <label
                                        className="block text-sm font-medium mb-1"
                                        htmlFor="edit-admin-user-name"
                                      >
                                        Name
                                      </label>
                                      <input
                                        id="edit-admin-user-name"
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        value={editUserForm.name}
                                        onChange={(e) =>
                                          handleEditUserChange(
                                            "name",
                                            e.target.value
                                          )
                                        }
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label
                                        className="block text-sm font-medium mb-1"
                                        htmlFor="edit-admin-user-email"
                                      >
                                        Email
                                      </label>
                                      <input
                                        id="edit-admin-user-email"
                                        type="email"
                                        className="w-full border rounded px-3 py-2"
                                        value={editUserForm.email}
                                        onChange={(e) =>
                                          handleEditUserChange(
                                            "email",
                                            e.target.value
                                          )
                                        }
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label
                                        className="block text-sm font-medium mb-1"
                                        htmlFor="edit-admin-user-role"
                                      >
                                        Role
                                      </label>
                                      <select
                                        id="edit-admin-user-role"
                                        className="w-full border rounded px-3 py-2"
                                        value={editUserForm.role}
                                        onChange={(e) =>
                                          handleEditUserChange(
                                            "role",
                                            e.target.value
                                          )
                                        }
                                        required
                                      >
                                        <option value="USER">User</option>
                                        <option value="ADMIN">Admin</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label
                                        className="block text-sm font-medium mb-1"
                                        htmlFor="edit-admin-user-token-balance"
                                      >
                                        Token Balance
                                      </label>
                                      <input
                                        id="edit-admin-user-token-balance"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full border rounded px-3 py-2"
                                        value={editUserForm.token_balance}
                                        onChange={(e) =>
                                          handleEditUserChange(
                                            "token_balance",
                                            e.target.value
                                          )
                                        }
                                        required
                                      />
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        type="submit"
                                        disabled={editingUser}
                                      >
                                        {editingUser
                                          ? "Saving..."
                                          : "Save Changes"}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={closeEditUser}
                                      >
                                        Cancel
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="ml-2"
                                onClick={() => handleDeleteAgent(u)}
                                disabled={deletingAgentId === u.id}
                              >
                                {deletingAgentId === u.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                  >
                    Prev
                  </Button>
                  <span className="text-sm">
                    Page {userPage} of{" "}
                    {Math.ceil(filteredUsers.length / userPageSize)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setUserPage((p) =>
                        p < Math.ceil(filteredUsers.length / userPageSize)
                          ? p + 1
                          : p
                      )
                    }
                    disabled={
                      userPage >= Math.ceil(filteredUsers.length / userPageSize)
                    }
                  >
                    Next
                  </Button>
                  <select
                    className="ml-2 border rounded px-1 py-0.5"
                    value={userPageSize}
                    onChange={(e) => {
                      setUserPageSize(Number(e.target.value));
                      setUserPage(1);
                    }}
                  >
                    {[10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size} / page
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle>Agents</CardTitle>
                <CardDescription>All AI agents</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleCreateAgent}
                  className="mb-6 space-y-4 max-w-xl"
                >
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="admin-agent-name"
                    >
                      Name
                    </label>
                    <input
                      id="admin-agent-name"
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={newAgent.name}
                      onChange={(e) =>
                        handleNewAgentChange("name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="admin-agent-description"
                    >
                      Description
                    </label>
                    <textarea
                      id="admin-agent-description"
                      className="w-full border rounded px-3 py-2"
                      value={newAgent.description}
                      onChange={(e) =>
                        handleNewAgentChange("description", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="admin-agent-category"
                    >
                      Category
                    </label>
                    <input
                      id="admin-agent-category"
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={newAgent.category}
                      onChange={(e) =>
                        handleNewAgentChange("category", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="admin-agent-price"
                    >
                      Price ($)
                    </label>
                    <input
                      id="admin-agent-price"
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full border rounded px-3 py-2"
                      value={newAgent.price}
                      onChange={(e) =>
                        handleNewAgentChange("price", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="admin-agent-subscription-price"
                    >
                      Subscription Price ($/month)
                    </label>
                    <input
                      id="admin-agent-subscription-price"
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full border rounded px-3 py-2"
                      value={newAgent.subscription_price}
                      onChange={(e) =>
                        handleNewAgentChange(
                          "subscription_price",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <Button type="submit" disabled={creatingAgent}>
                    {creatingAgent ? "Creating..." : "Create Agent"}
                  </Button>
                </form>
                {loadingAgents ? (
                  <div>Loading agents...</div>
                ) : errorAgents ? (
                  <div className="text-red-600">{errorAgents}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-2 font-medium">ID</th>
                          <th className="pb-2 font-medium">Name</th>
                          <th className="pb-2 font-medium">Category</th>
                          <th className="pb-2 font-medium">Price</th>
                          <th className="pb-2 font-medium">
                            Subscription Price
                          </th>
                          <th className="pb-2 font-medium">Created By</th>
                          <th className="pb-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedAgents.map((agent: any) => (
                          <tr key={agent.id} className="border-b">
                            <td className="py-3">{agent.id}</td>
                            <td className="py-3">{agent.name}</td>
                            <td className="py-3">{agent.category}</td>
                            <td className="py-3">
                              $
                              {agent.price?.toFixed
                                ? agent.price.toFixed(2)
                                : agent.price}
                            </td>
                            <td className="py-3">
                              $
                              {agent.subscription_price?.toFixed
                                ? agent.subscription_price.toFixed(2)
                                : agent.subscription_price}
                            </td>
                            <td className="py-3">{agent.created_by}</td>
                            <td className="py-3">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditAgent(agent)}
                                  >
                                    Edit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Agent</DialogTitle>
                                    <DialogDescription>
                                      Update agent details
                                    </DialogDescription>
                                  </DialogHeader>
                                  <form
                                    onSubmit={handleUpdateAgent}
                                    className="space-y-4"
                                  >
                                    <div>
                                      <label
                                        className="block text-sm font-medium mb-1"
                                        htmlFor="edit-admin-agent-name"
                                      >
                                        Name
                                      </label>
                                      <input
                                        id="edit-admin-agent-name"
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        value={editAgentForm.name}
                                        onChange={(e) =>
                                          handleEditAgentChange(
                                            "name",
                                            e.target.value
                                          )
                                        }
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label
                                        className="block text-sm font-medium mb-1"
                                        htmlFor="edit-admin-agent-description"
                                      >
                                        Description
                                      </label>
                                      <textarea
                                        id="edit-admin-agent-description"
                                        className="w-full border rounded px-3 py-2"
                                        value={editAgentForm.description}
                                        onChange={(e) =>
                                          handleEditAgentChange(
                                            "description",
                                            e.target.value
                                          )
                                        }
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label
                                        className="block text-sm font-medium mb-1"
                                        htmlFor="edit-admin-agent-category"
                                      >
                                        Category
                                      </label>
                                      <input
                                        id="edit-admin-agent-category"
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        value={editAgentForm.category}
                                        onChange={(e) =>
                                          handleEditAgentChange(
                                            "category",
                                            e.target.value
                                          )
                                        }
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label
                                        className="block text-sm font-medium mb-1"
                                        htmlFor="edit-admin-agent-price"
                                      >
                                        Price ($)
                                      </label>
                                      <input
                                        id="edit-admin-agent-price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full border rounded px-3 py-2"
                                        value={editAgentForm.price}
                                        onChange={(e) =>
                                          handleEditAgentChange(
                                            "price",
                                            e.target.value
                                          )
                                        }
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label
                                        className="block text-sm font-medium mb-1"
                                        htmlFor="edit-admin-agent-subscription-price"
                                      >
                                        Subscription Price ($/month)
                                      </label>
                                      <input
                                        id="edit-admin-agent-subscription-price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full border rounded px-3 py-2"
                                        value={editAgentForm.subscription_price}
                                        onChange={(e) =>
                                          handleEditAgentChange(
                                            "subscription_price",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        type="submit"
                                        disabled={editingAgent}
                                      >
                                        {editingAgent
                                          ? "Saving..."
                                          : "Save Changes"}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={closeEditAgent}
                                      >
                                        Cancel
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="ml-2"
                                onClick={() => handleDeleteAgent(agent)}
                                disabled={deletingAgentId === agent.id}
                              >
                                {deletingAgentId === agent.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>All orders</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div>Loading orders...</div>
                ) : errorOrders ? (
                  <div className="text-red-600">{errorOrders}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-2 font-medium">Order ID</th>
                          <th className="pb-2 font-medium">User</th>
                          <th className="pb-2 font-medium">Agent</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 font-medium">Type</th>
                          <th className="pb-2 font-medium">Price</th>
                          <th className="pb-2 font-medium">Created At</th>
                          <th className="pb-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedOrders.map((order: any) => (
                          <tr key={order.id} className="border-b">
                            <td className="py-3">{order.id}</td>
                            <td className="py-3">{order.user_id}</td>
                            <td className="py-3">{order.agent_id}</td>
                            <td className="py-3">{order.payment_status}</td>
                            <td className="py-3">{order.order_type}</td>
                            <td className="py-3">
                              $
                              {order.price?.toFixed
                                ? order.price.toFixed(2)
                                : order.price}
                            </td>
                            <td className="py-3">
                              {order.created_at
                                ? new Date(
                                    order.created_at
                                  ).toLocaleDateString()
                                : ""}
                            </td>
                            <td className="py-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditAgent(order)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="ml-2"
                                onClick={() => handleDeleteAgent(order)}
                                disabled={deletingAgentId === order.id}
                              >
                                {deletingAgentId === order.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
                <CardDescription>All payments</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPayments ? (
                  <div>Loading payments...</div>
                ) : errorPayments ? (
                  <div className="text-red-600">{errorPayments}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-2 font-medium">Payment ID</th>
                          <th className="pb-2 font-medium">Order</th>
                          <th className="pb-2 font-medium">Amount</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 font-medium">Gateway</th>
                          <th className="pb-2 font-medium">Date</th>
                          <th className="pb-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedPayments.map((payment: any) => (
                          <tr key={payment.id} className="border-b">
                            <td className="py-3">{payment.id}</td>
                            <td className="py-3">{payment.order_id}</td>
                            <td className="py-3">
                              $
                              {payment.amount?.toFixed
                                ? payment.amount.toFixed(2)
                                : payment.amount}
                            </td>
                            <td className="py-3">{payment.status}</td>
                            <td className="py-3">
                              {payment.gateway || payment.payment_gateway}
                            </td>
                            <td className="py-3">
                              {payment.created_at
                                ? new Date(
                                    payment.created_at
                                  ).toLocaleDateString()
                                : ""}
                            </td>
                            <td className="py-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewPayment(payment)}
                              >
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditAgent(payment)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="ml-2"
                                onClick={() => handleDeleteAgent(payment)}
                                disabled={deletingAgentId === payment.id}
                              >
                                {deletingAgentId === payment.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      <Dialog
        open={!!viewPayment}
        onOpenChange={(v) => {
          if (!v) closeViewPayment();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {loadingPaymentDetails ? (
            <div>Loading...</div>
          ) : errorPaymentDetails ? (
            <div className="text-red-600">{errorPaymentDetails}</div>
          ) : paymentDetails ? (
            <div>
              <div>
                <b>Payment ID:</b> {paymentDetails.id}
              </div>
              <div>
                <b>Order:</b> {paymentDetails.order_id}
              </div>
              <div>
                <b>Amount:</b> ${paymentDetails.amount}
              </div>
              <div>
                <b>Status:</b> {paymentDetails.status}
              </div>
              <div>
                <b>Gateway:</b>{" "}
                {paymentDetails.gateway || paymentDetails.payment_gateway}
              </div>
              <div>
                <b>Date:</b> {paymentDetails.created_at}
              </div>
              {/* Add more fields as needed */}
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeViewPayment}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// TODO: Add server-side admin route protection (middleware or getServerSideProps) to block non-admins from accessing /admin even if they bypass client-side checks.
