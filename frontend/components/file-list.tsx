"use client"
import { FileIcon, Download, Eye, MoreHorizontal, Calendar, User, HardDrive } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { File } from "@/lib/store"

interface FileListProps {
  files: File[]
  selectedFileId?: string | null
  onFileSelect: (fileId: string) => void
  onFileVisibilityChange: (fileId: string, visibleTo: string[] | "All") => void
  onFileDownload?: (fileId: string) => void
}

export function FileList({ files, selectedFileId, onFileSelect, onFileVisibilityChange, onFileDownload }: FileListProps) {
  const formatFileSize = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB"]
    if (bytes === 0) return "0 B"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getFileIcon = (type: string) => {
    return <FileIcon className="h-4 w-4 text-muted-foreground" />
  }

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

  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div className="space-y-3">
          <FileIcon className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="font-medium text-foreground">No files in this folder</h3>
            <p className="text-sm text-muted-foreground">Upload documents to get started</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead className="w-[300px]">Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Modified</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow
              key={file.id}
              className={cn("cursor-pointer hover:bg-muted/50", selectedFileId === file.id && "bg-accent")}
              onClick={() => onFileSelect(file.id)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{file.name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-3 w-3" />
                  {formatFileSize(file.size)}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {formatDate(file.modified)}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  v{file.version}
                </Badge>
              </TableCell>
              <TableCell>{getVisibilityBadge(file.visibleTo)}</TableCell>
              <TableCell className="text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  {file.uploadedBy}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onFileDownload?.(file.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onFileVisibilityChange(file.id, "All")}>
                      Share with All Buyers
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onFileVisibilityChange(file.id, ["Buyer A"])}>
                      Share with Buyer A only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
