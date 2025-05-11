"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { apiGet, apiPost, apiPut } from "@/services/api"
import { Loader2 } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  token_balance: number
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    token_balance: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await apiGet<{ items: User[] }>("/users")
      setUsers(data.items || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      token_balance: user.token_balance,
    })
  }

  const handleSave = async () => {
    if (!editUser) return

    try {
      await apiPut(`/users/${editUser.id}`, editForm)
      await fetchUsers()
      setEditUser(null)
      toast({
        title: "Success",
        description: "User updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Users</h1>
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Token Balance</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.token_balance}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Input
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({ ...editForm, role: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Token Balance</label>
              <Input
                type="number"
                value={editForm.token_balance}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    token_balance: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
} 