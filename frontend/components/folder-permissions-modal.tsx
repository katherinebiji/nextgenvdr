"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Folder, FolderOpen } from "lucide-react"
import type { User, Folder as FolderType } from "@/lib/store"

interface FolderPermissionsModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  folders: FolderType[]
  onUpdatePermissions: (userId: string, folderIds: string[]) => void
}

export function FolderPermissionsModal({
  isOpen,
  onClose,
  user,
  folders,
  onUpdatePermissions,
}: FolderPermissionsModalProps) {
  const [selectedFolders, setSelectedFolders] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      setSelectedFolders(user.folderPermissions || [])
    }
  }, [user])

  if (!user) return null

  const handleFolderToggle = (folderId: string, checked: boolean) => {
    if (checked) {
      setSelectedFolders((prev) => [...prev, folderId])
    } else {
      setSelectedFolders((prev) => prev.filter((id) => id !== folderId))
    }
  }

  const handleSelectAll = () => {
    const allFolderIds = folders.filter((f) => !f.parentId).map((f) => f.id)
    setSelectedFolders(allFolderIds)
  }

  const handleSelectNone = () => {
    setSelectedFolders([])
  }

  const handleSave = () => {
    onUpdatePermissions(user.id, selectedFolders)
    onClose()
  }

  const buildFolderTree = (parentId?: string, level = 0): React.ReactNode[] => {
    return folders
      .filter((folder) => folder.parentId === parentId)
      .map((folder) => {
        const children = folders.filter((f) => f.parentId === folder.id)
        const hasChildren = children.length > 0
        const isSelected = selectedFolders.includes(folder.id)

        return (
          <div key={folder.id}>
            <div
              className="flex items-center space-x-2 py-2 hover:bg-muted/50 rounded-md px-2"
              style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
              <Checkbox
                id={folder.id}
                checked={isSelected}
                onCheckedChange={(checked) => handleFolderToggle(folder.id, checked as boolean)}
              />
              {hasChildren ? (
                <FolderOpen className="h-4 w-4 text-primary" />
              ) : (
                <Folder className="h-4 w-4 text-muted-foreground" />
              )}
              <label htmlFor={folder.id} className="text-sm font-medium cursor-pointer flex-1">
                {folder.name}
              </label>
              <Badge variant="outline" className="text-xs">
                {folder.visibleTo === "All" ? "All" : `${(folder.visibleTo as string[]).length} buyers`}
              </Badge>
            </div>
            {hasChildren && buildFolderTree(folder.id, level + 1)}
          </div>
        )
      })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Folder Permissions - {user.name}</DialogTitle>
          <DialogDescription>
            Select which folders this user can access. Permissions will apply to all subfolders.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedFolders.length} of {folders.filter((f) => !f.parentId).length} main folders selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleSelectNone}>
                Select None
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[400px] border border-border rounded-md p-4">
            <div className="space-y-1">{buildFolderTree()}</div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Permissions</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
