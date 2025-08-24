"use client"

import type React from "react"

import { useState } from "react"
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Folder as FolderType, File } from "@/lib/store"

interface FolderTreeProps {
  folders: FolderType[]
  files: File[] // Added files prop to calculate file counts
  onFolderSelect: (folderId: string) => void
  selectedFolderId?: string | null
}

interface FolderNodeProps {
  folder: FolderType
  level: number
  isExpanded: boolean
  isSelected: boolean
  onToggle: () => void
  onSelect: () => void
  fileCount: number // Added file count prop
  hasChildren: boolean // Added hasChildren prop
  children?: React.ReactNode
}

function FolderNode({
  folder,
  level,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  fileCount,
  hasChildren,
  children,
}: FolderNodeProps) {

  const getVisibilityBadge = (visibleTo: string[] | "All") => {
    if (visibleTo === "All") {
      return (
        <Badge variant="outline" className="text-xs">
          All Buyers
        </Badge>
      )
    }
    if (Array.isArray(visibleTo) && visibleTo.length === 1) {
      return (
        <Badge variant="secondary" className="text-xs">
          {visibleTo[0]} only
        </Badge>
      )
    }
    if (Array.isArray(visibleTo) && visibleTo.length > 1) {
      return (
        <Badge variant="secondary" className="text-xs">
          {visibleTo.length} buyers
        </Badge>
      )
    }
    return null
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 hover:bg-muted/50 cursor-pointer group",
          isSelected && "bg-accent text-accent-foreground",
          "transition-colors",
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={onSelect}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        )}

        {!hasChildren && <div className="w-4" />}

        {isExpanded && hasChildren ? (
          <FolderOpen className="h-4 w-4 text-primary" />
        ) : (
          <Folder className="h-4 w-4 text-muted-foreground" />
        )}

        <span className="flex-1 text-sm font-medium truncate">{folder.name}</span>

        <span className="text-xs text-muted-foreground/60 mr-2">
          {fileCount > 0 && `${fileCount} file${fileCount !== 1 ? "s" : ""}`}
        </span>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {getVisibilityBadge(folder.visibleTo)}
        </div>
      </div>

      {isExpanded && children && <div>{children}</div>}
    </div>
  )
}

export function FolderTree({ folders, files, onFolderSelect, selectedFolderId }: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["legal", "commercial", "financial", "hr", "ip", "it"]),
  )

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const getFileCountForFolder = (folderId: string): number => {
    // Get direct files in this folder
    const directFiles = files.filter((file) => file.folderId === folderId).length

    // Get files in all subfolders recursively
    const getSubfolderFiles = (parentId: string): number => {
      const subfolders = folders.filter((folder) => folder.parentId === parentId)
      let subfolderFileCount = 0

      for (const subfolder of subfolders) {
        subfolderFileCount += files.filter((file) => file.folderId === subfolder.id).length
        subfolderFileCount += getSubfolderFiles(subfolder.id)
      }

      return subfolderFileCount
    }

    return directFiles + getSubfolderFiles(folderId)
  }

  const buildTree = (parentId?: string, level = 0): React.ReactNode[] => {
    return folders
      .filter((folder) => folder.parentId === parentId)
      .map((folder) => {
        const children = folders.filter((f) => f.parentId === folder.id)
        const hasChildren = children.length > 0
        const isExpanded = expandedFolders.has(folder.id)
        const isSelected = selectedFolderId === folder.id
        const fileCount = getFileCountForFolder(folder.id) // Calculate file count for this folder

        return (
          <FolderNode
            key={folder.id}
            folder={folder}
            level={level}
            isExpanded={isExpanded}
            isSelected={isSelected}
            onToggle={() => toggleFolder(folder.id)}
            onSelect={() => onFolderSelect(folder.id)}
            fileCount={fileCount}
            hasChildren={hasChildren}
          >
            {hasChildren && isExpanded ? buildTree(folder.id, level + 1) : undefined}
          </FolderNode>
        )
      })
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Document Structure</h3>
      </div>
      <div className="py-2">{buildTree()}</div>
    </div>
  )
}
