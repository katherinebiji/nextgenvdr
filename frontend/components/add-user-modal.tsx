"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, Building } from "lucide-react"
import type { User as UserType } from "@/lib/store"

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onAddUser: (user: UserType) => void
  editingUser?: UserType | null
}

export function AddUserModal({ isOpen, onClose, onAddUser, editingUser }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: editingUser?.name || "",
    email: editingUser?.email || "",
    role: editingUser?.role || "",
    access: editingUser?.access || { view: true, upload: false, qa: false, respond: false },
    buyerGroup: editingUser?.buyerGroup || "",
  })

  const roles = [
    "Seller Admin",
    "Seller Analyst",
    "Company Legal",
    "Company Finance",
    "Company HR",
    "Company IT",
    "Buyer A",
    "Buyer B",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newUser: UserType = {
      id: editingUser?.id || `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      avatar: formData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      access: formData.access,
      folderPermissions: editingUser?.folderPermissions || [],
      buyerGroup: formData.role.includes("Buyer") ? formData.role : undefined,
    }

    onAddUser(newUser)
    onClose()

    // Reset form
    setFormData({
      name: "",
      email: "",
      role: "",
      access: { view: true, upload: false, qa: false, respond: false },
      buyerGroup: "",
    })
  }

  const handleAccessChange = (accessType: keyof UserType["access"], checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      access: { ...prev.access, [accessType]: checked },
    }))
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {editingUser ? "Update user information and permissions." : "Add a new user to the data room."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {formData.name ? getInitials(formData.name) : <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="john.doe@company.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <Building className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Access Permissions */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Access Permissions</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="view"
                  checked={formData.access.view}
                  onCheckedChange={(checked) => handleAccessChange("view", checked as boolean)}
                />
                <Label htmlFor="view" className="text-sm">
                  View Documents
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="upload"
                  checked={formData.access.upload}
                  onCheckedChange={(checked) => handleAccessChange("upload", checked as boolean)}
                />
                <Label htmlFor="upload" className="text-sm">
                  Upload Documents
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="qa"
                  checked={formData.access.qa}
                  onCheckedChange={(checked) => handleAccessChange("qa", checked as boolean)}
                />
                <Label htmlFor="qa" className="text-sm">
                  Submit Q&A
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="respond"
                  checked={formData.access.respond}
                  onCheckedChange={(checked) => handleAccessChange("respond", checked as boolean)}
                />
                <Label htmlFor="respond" className="text-sm">
                  Respond to Q&A
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || !formData.email || !formData.role}>
              {editingUser ? "Update User" : "Add User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
