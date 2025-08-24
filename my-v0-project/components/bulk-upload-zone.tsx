"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Upload, File, X, CheckCircle, AlertCircle, Folder, Brain, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface UploadFile {
  id: string
  name: string
  size: number
  status: "pending" | "uploading" | "completed" | "error"
  progress: number
  folder?: string
  aiSuggestion?: {
    folder: string
    confidence: number
    reason: string
  }
  error?: string
}

interface FilePreview {
  id: string
  name: string
  folder: string
  accessUsers: string[]
}

const folders = [
  "Financial Statements",
  "Legal Documents",
  "Contracts",
  "IP Portfolio",
  "HR Documents",
  "IT & Security",
  "Operations",
  "Marketing Materials",
]

const getAISuggestion = (fileName: string) => {
  const name = fileName.toLowerCase()

  if (name.includes("financial") || name.includes("balance") || name.includes("income") || name.includes("cash")) {
    return { folder: "Financial Statements", confidence: 95, reason: "Contains financial keywords" }
  }
  if (name.includes("contract") || name.includes("agreement") || name.includes("terms")) {
    return { folder: "Contracts", confidence: 90, reason: "Contract-related document" }
  }
  if (name.includes("legal") || name.includes("compliance") || name.includes("regulation")) {
    return { folder: "Legal Documents", confidence: 88, reason: "Legal terminology detected" }
  }
  if (name.includes("patent") || name.includes("trademark") || name.includes("ip") || name.includes("intellectual")) {
    return { folder: "IP Portfolio", confidence: 92, reason: "Intellectual property content" }
  }
  if (name.includes("employee") || name.includes("hr") || name.includes("payroll") || name.includes("benefits")) {
    return { folder: "HR Documents", confidence: 87, reason: "Human resources related" }
  }
  if (name.includes("security") || name.includes("it") || name.includes("tech") || name.includes("system")) {
    return { folder: "IT & Security", confidence: 85, reason: "Technology/security content" }
  }
  if (name.includes("marketing") || name.includes("brand") || name.includes("campaign")) {
    return { folder: "Marketing Materials", confidence: 89, reason: "Marketing-related content" }
  }

  return { folder: "Operations", confidence: 70, reason: "General business document" }
}

export function BulkUploadZone() {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [defaultFolder, setDefaultFolder] = useState<string>("")
  const [folderMode, setFolderMode] = useState<"manual" | "ai">("manual")
  const [showPreview, setShowPreview] = useState(false)
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const droppedFiles = Array.from(e.dataTransfer.files)
      addFiles(droppedFiles)
    },
    [folderMode],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files)
        addFiles(selectedFiles)
      }
    },
    [folderMode],
  )

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => {
      const aiSuggestion = getAISuggestion(file.name)

      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        status: "pending",
        progress: 0,
        folder: folderMode === "ai" ? aiSuggestion.folder : defaultFolder || undefined,
        aiSuggestion: aiSuggestion,
      }
    })

    setFiles((prev) => [...prev, ...uploadFiles])
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const updateFileFolder = (id: string, folder: string) => {
    setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, folder } : file)))
  }

  const startUpload = () => {
    if (folderMode === "ai") {
      files.forEach((file, index) => {
        if (file.status === "pending") {
          setTimeout(() => {
            setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: "uploading" } : f)))

            const interval = setInterval(() => {
              setFiles((prev) =>
                prev.map((f) => {
                  if (f.id === file.id && f.status === "uploading") {
                    const newProgress = Math.min(f.progress + 10, 100)
                    if (newProgress === 100) {
                      clearInterval(interval)
                      return { ...f, progress: 100, status: "completed" }
                    }
                    return { ...f, progress: newProgress }
                  }
                  return f
                }),
              )
            }, 200)
          }, index * 500)
        }
      })

      setTimeout(
        () => {
          const previews: FilePreview[] = files.map((file) => ({
            id: file.id,
            name: file.name,
            folder: file.folder || "Operations",
            accessUsers: getFolderAccessUsers(file.folder || "Operations"),
          }))
          setFilePreviews(previews)
          setShowPreview(true)
        },
        files.length * 500 + 2000,
      )
    } else {
      files.forEach((file, index) => {
        if (file.status === "pending") {
          setTimeout(() => {
            setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: "uploading" } : f)))

            const interval = setInterval(() => {
              setFiles((prev) =>
                prev.map((f) => {
                  if (f.id === file.id && f.status === "uploading") {
                    const newProgress = Math.min(f.progress + 10, 100)
                    if (newProgress === 100) {
                      clearInterval(interval)
                      return { ...f, progress: 100, status: "completed" }
                    }
                    return { ...f, progress: newProgress }
                  }
                  return f
                }),
              )
            }, 200)
          }, index * 500)
        }
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "uploading":
        return <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      default:
        return <File className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getFolderAccessUsers = (folder: string): string[] => {
    const folderAccess: Record<string, string[]> = {
      "Financial Statements": ["John Smith (Seller Admin)", "Sarah Chen (Company Finance)", "Mike Johnson (Buyer A)"],
      "Legal Documents": ["John Smith (Seller Admin)", "Lisa Wang (Company Legal)", "David Brown (Buyer A)"],
      Contracts: [
        "John Smith (Seller Admin)",
        "Lisa Wang (Company Legal)",
        "Mike Johnson (Buyer A)",
        "Emma Davis (Buyer B)",
      ],
      "IP Portfolio": ["John Smith (Seller Admin)", "Lisa Wang (Company Legal)", "Tom Wilson (Buyer A)"],
      "HR Documents": ["John Smith (Seller Admin)", "Alex Rodriguez (Company HR)", "Mike Johnson (Buyer A)"],
      "IT & Security": ["John Smith (Seller Admin)", "Chris Lee (Company IT)", "David Brown (Buyer A)"],
      Operations: ["John Smith (Seller Admin)", "Maria Garcia (Seller Analyst)", "Mike Johnson (Buyer A)"],
      "Marketing Materials": ["John Smith (Seller Admin)", "Maria Garcia (Seller Analyst)", "Emma Davis (Buyer B)"],
    }
    return folderAccess[folder] || ["John Smith (Seller Admin)"]
  }

  const confirmPlacement = () => {
    setShowPreview(false)
    setFiles([])
    setFilePreviews([])
  }

  const pendingFiles = files.filter((f) => f.status === "pending").length
  const completedFiles = files.filter((f) => f.status === "completed").length
  const totalFiles = files.length

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk File Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Folder Assignment:</label>
              <RadioGroup value={folderMode} onValueChange={(value: "manual" | "ai") => setFolderMode(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="manual" />
                  <Label htmlFor="manual" className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    Manual Selection
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ai" id="ai" />
                  <Label htmlFor="ai" className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    Auto Folder Selection
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Smart
                    </Badge>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {folderMode === "manual" && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Default Folder:</label>
                <Select value={defaultFolder} onValueChange={setDefaultFolder}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select default folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder) => (
                      <SelectItem key={folder} value={folder}>
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4" />
                          {folder}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {folderMode === "ai" && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Auto Folder Selection</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  AI will analyze file names and content to suggest the most relevant folders automatically.
                </p>
              </div>
            )}

            {/* Drop Zone */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Drop files here or click to browse</h3>
              <p className="text-muted-foreground mb-4">
                Support for multiple file formats: PDF, DOC, XLS, PPT, TXT, and more
              </p>
              <input type="file" multiple onChange={handleFileSelect} className="hidden" id="file-upload" />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Select Files
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upload Queue ({totalFiles} files)</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{completedFiles} completed</Badge>
                <Badge variant="outline">{pendingFiles} pending</Badge>
                {pendingFiles > 0 && (
                  <Button onClick={startUpload} size="sm">
                    Start Upload
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-shrink-0">{getStatusIcon(file.status)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>

                    {file.status === "uploading" && <Progress value={file.progress} className="h-1" />}

                    <div className="flex items-center gap-2 mt-2">
                      <Select value={file.folder || ""} onValueChange={(value) => updateFileFolder(file.id, value)}>
                        <SelectTrigger className="w-48 h-7 text-xs">
                          <SelectValue placeholder="Select folder" />
                        </SelectTrigger>
                        <SelectContent>
                          {folders.map((folder) => (
                            <SelectItem key={folder} value={folder}>
                              <div className="flex items-center gap-2">
                                <Folder className="h-3 w-3" />
                                {folder}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {file.aiSuggestion && (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            <Brain className="h-3 w-3 mr-1" />
                            {file.aiSuggestion.confidence}%
                          </Badge>
                          <div className="text-xs text-muted-foreground" title={file.aiSuggestion.reason}>
                            {file.aiSuggestion.reason}
                          </div>
                        </div>
                      )}

                      <Badge variant={file.status === "completed" ? "default" : "secondary"}>{file.status}</Badge>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={file.status === "uploading"}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Placement Preview Modal */}
      {showPreview && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              File Placement Preview
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Review where your files will be placed and who will have access to them.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filePreviews.map((preview) => (
                <div key={preview.id} className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{preview.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Uploaded
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Destination:</span>
                      <Badge variant="secondary">{preview.folder}</Badge>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                        </div>
                        <span className="text-sm font-medium">Access:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {preview.accessUsers.map((user, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {user}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Review Changes
                </Button>
                <Button onClick={confirmPlacement}>Confirm Placement</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
