"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { PermissionsTable } from "@/components/permissions-table"
import { AddUserModal } from "@/components/add-user-modal"
import { FolderPermissionsModal } from "@/components/folder-permissions-modal"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { useAppStore, type User } from "@/lib/store"
import { mockUsers, mockFolders } from "@/lib/mock-data"

export default function UsersPage() {
  const params = useParams()
  const { addUser, updateUser, removeUser, updateUserFolderPermissions } = useAppStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [permissionsUser, setPermissionsUser] = useState<User | null>(null)

  const isBuySide = params.projectId === "project-valley"

  const handleAddUser = () => {
    setEditingUser(null)
    setShowAddModal(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowAddModal(true)
  }

  const handleRemoveUser = (userId: string) => {
    if (confirm("Are you sure you want to remove this user?")) {
      removeUser(userId)
    }
  }

  const handleEditFolderPermissions = (user: User) => {
    setPermissionsUser(user)
    setShowPermissionsModal(true)
  }

  const handleSaveUser = (user: User) => {
    if (editingUser) {
      updateUser(user.id, user)
    } else {
      addUser(user)
    }
  }

  const handleUpdatePermissions = (userId: string, folderIds: string[]) => {
    updateUserFolderPermissions(userId, folderIds)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col gap-2">
            <BreadcrumbNav />
            <div>
              <h1 className="text-xl font-semibold">Users & Permissions</h1>
              <p className="text-sm text-muted-foreground">Manage user access and folder permissions</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6">
        <PermissionsTable
          users={mockUsers}
          onAddUser={handleAddUser}
          onEditUser={handleEditUser}
          onRemoveUser={handleRemoveUser}
          onEditFolderPermissions={handleEditFolderPermissions}
          isBuySide={isBuySide}
        />
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddUser={handleSaveUser}
        editingUser={editingUser}
      />

      <FolderPermissionsModal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        user={permissionsUser}
        folders={mockFolders}
        onUpdatePermissions={handleUpdatePermissions}
      />
    </div>
  )
}
