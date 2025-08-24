"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Settings, Trash2, Edit, Shield } from "lucide-react"
import type { User } from "@/lib/store"

interface PermissionsTableProps {
  users: User[]
  onAddUser: () => void
  onEditUser: (user: User) => void
  onRemoveUser: (userId: string) => void
  onEditFolderPermissions: (user: User) => void
  isBuySide?: boolean
}

export function PermissionsTable({
  users,
  onAddUser,
  onEditUser,
  onRemoveUser,
  onEditFolderPermissions,
  isBuySide = false,
}: PermissionsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("All")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "All" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    if (role.includes("Buyer")) {
      return (
        <Badge variant="outline" className="bg-primary/10 text-primary">
          {role}
        </Badge>
      )
    }
    if (role.includes("Admin")) {
      return <Badge className="bg-secondary text-secondary-foreground">{role}</Badge>
    }
    return <Badge variant="secondary">{role}</Badge>
  }

  const getAccessBadges = (access: User["access"]) => {
    const badges = []
    if (access.view) badges.push("View")
    if (access.upload) badges.push("Upload")
    if (access.qa) badges.push("Q&A")
    if (access.respond) badges.push("Respond")
    return badges
  }

  const uniqueRoles = Array.from(new Set(users.map((u) => u.role)))

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {!isBuySide && (
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Roles</SelectItem>
                {uniqueRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Button onClick={onAddUser} className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50">
            <TableRow>
              <TableHead className="w-[250px]">User</TableHead>
              {!isBuySide && <TableHead>Role</TableHead>}
              {!isBuySide && <TableHead>Access</TableHead>}
              {!isBuySide && <TableHead>Folder Access</TableHead>}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{user.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{user.name}</div>
                      <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                {!isBuySide && <TableCell>{getRoleBadge(user.role)}</TableCell>}
                {!isBuySide && (
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getAccessBadges(user.access).map((access) => (
                        <Badge key={access} variant="outline" className="text-xs">
                          {access}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                )}
                {!isBuySide && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {user.folderPermissions.length} folder{user.folderPermissions.length !== 1 ? "s" : ""}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditFolderPermissions(user)}
                        className="h-6 px-2 text-xs"
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditUser(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      {!isBuySide && (
                        <DropdownMenuItem onClick={() => onEditFolderPermissions(user)}>
                          <Shield className="h-4 w-4 mr-2" />
                          Folder Permissions
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onRemoveUser(user.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
