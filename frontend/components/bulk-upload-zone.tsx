"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { Upload, File, X, CheckCircle, AlertCircle, Folder, Brain, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"
import type { File as StoreFile, Folder } from "@/lib/store"
import { mockFolders } from "@/lib/mock-data"

interface UploadFile {
  id: string
  name: string
  size: number
  status: "pending" | "uploading" | "completed" | "error"
  progress: number
  folder?: string
  content?: globalThis.File
  documentId?: string  // Backend document ID after upload
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

// Get all subfolders (folders that have a parentId) - files should only go to subfolders
const getSubfolders = (): Folder[] => {
  return mockFolders.filter(folder => folder.parentId)
}

// Helper to get folder display name with parent context
const getFolderDisplayName = (folder: Folder): string => {
  const parentFolder = mockFolders.find(f => f.id === folder.parentId)
  return parentFolder ? `${parentFolder.name} / ${folder.name}` : folder.name
}

const getAISuggestion = (fileName: string) => {
  const name = fileName.toLowerCase()
  const subfolders = getSubfolders()

  // Financial documents
  if (name.includes("financial") || name.includes("balance") || name.includes("income") || name.includes("cash") || name.includes("revenue") || name.includes("audit")) {
    if (name.includes("accounting") || name.includes("statement") || name.includes("audit")) {
      return { folder: "financial-accounting", confidence: 95, reason: "Financial accounting document" }
    }
    if (name.includes("operation") || name.includes("budget")) {
      return { folder: "financial-operations", confidence: 90, reason: "Financial operations document" }
    }
    return { folder: "financial-finance", confidence: 85, reason: "General financial document" }
  }
  
  // Legal documents
  if (name.includes("legal") || name.includes("compliance") || name.includes("regulation") || name.includes("law") || name.includes("litigation")) {
    if (name.includes("corporate") || name.includes("incorporation") || name.includes("bylaw")) {
      return { folder: "legal-corp", confidence: 95, reason: "Corporate legal document" }
    }
    if (name.includes("management") || name.includes("board") || name.includes("resolution")) {
      return { folder: "legal-mgmt", confidence: 90, reason: "Management/board document" }
    }
    return { folder: "legal-legal", confidence: 80, reason: "General legal document" }
  }
  
  // IP documents
  if (name.includes("patent") || name.includes("trademark") || name.includes("ip") || name.includes("intellectual") || name.includes("copyright")) {
    if (name.includes("registration") || name.includes("patent") || name.includes("trademark")) {
      return { folder: "ip-registrations", confidence: 95, reason: "IP registration document" }
    }
    if (name.includes("contract") || name.includes("license")) {
      return { folder: "ip-contracts", confidence: 90, reason: "IP contract document" }
    }
    return { folder: "ip-development", confidence: 80, reason: "IP development document" }
  }
  
  // HR documents
  if (name.includes("employee") || name.includes("hr") || name.includes("payroll") || name.includes("benefits") || name.includes("personnel")) {
    if (name.includes("policy") || name.includes("handbook")) {
      return { folder: "hr-policies", confidence: 90, reason: "HR policy document" }
    }
    if (name.includes("benefit") || name.includes("insurance")) {
      return { folder: "hr-benefits", confidence: 90, reason: "Benefits document" }
    }
    return { folder: "hr-general", confidence: 80, reason: "General HR document" }
  }
  
  // IT documents
  if (name.includes("security") || name.includes("it") || name.includes("tech") || name.includes("system") || name.includes("software")) {
    if (name.includes("security") || name.includes("cyber")) {
      return { folder: "it-security", confidence: 90, reason: "IT security document" }
    }
    return { folder: "it-administration", confidence: 80, reason: "IT administration document" }
  }
  
  // Commercial documents
  if (name.includes("contract") || name.includes("agreement") || name.includes("terms") || name.includes("commercial") || name.includes("sales") || name.includes("purchase")) {
    if (name.includes("customer") || name.includes("client")) {
      return { folder: "commercial-customers", confidence: 90, reason: "Customer-related document" }
    }
    if (name.includes("supplier") || name.includes("vendor")) {
      return { folder: "commercial-suppliers", confidence: 90, reason: "Supplier-related document" }
    }
    if (name.includes("policy")) {
      return { folder: "commercial-policies", confidence: 85, reason: "Commercial policy document" }
    }
    return { folder: "commercial-customers", confidence: 70, reason: "General commercial document" }
  }

  // Default to a common subfolder
  return { folder: "commercial-customers", confidence: 60, reason: "General business document" }
}

export function BulkUploadZone() {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [defaultFolder, setDefaultFolder] = useState<string>("")
  const [folderMode, setFolderMode] = useState<"manual" | "ai">("manual")
  const [showPreview, setShowPreview] = useState(false)
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { currentUser, currentProject, uploadFileToBackend, processDocumentForRAG } = useAppStore()
  const subfolders = getSubfolders()

  // Update existing files when folder mode changes
  useEffect(() => {
    setFiles(prevFiles => 
      prevFiles.map(file => ({
        ...file,
        folder: folderMode === "ai" 
          ? file.aiSuggestion?.folder 
          : defaultFolder || undefined
      }))
    )
  }, [folderMode, defaultFolder])

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

  const addFiles = async (newFiles: globalThis.File[]) => {
    const uploadFiles: UploadFile[] = []
    
    for (const file of newFiles) {
      const aiSuggestion = getAISuggestion(file.name)
      
      const uploadFile: UploadFile = {
        id: Math.random().toString(36).substring(2, 11),
        name: file.name,
        size: file.size,
        status: "pending",
        progress: 0,
        folder: folderMode === "ai" ? aiSuggestion.folder : defaultFolder || undefined,
        content: file,  // Store the actual File object for upload
        aiSuggestion: aiSuggestion,
      }
      
      uploadFiles.push(uploadFile)
    }

    setFiles((prev) => [...prev, ...uploadFiles])
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const updateFileFolder = (id: string, folder: string) => {
    setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, folder } : file)))
  }

  const startUpload = async () => {
    if (!currentUser || !currentProject) {
      console.error("User or project not available")
      return
    }

    // Assign default folder for files without folders before processing
    setFiles(prev => prev.map(f => 
      f.status === "pending" && !f.folder 
        ? { ...f, folder: "commercial-customers" } // Default fallback folder
        : f
    ))

    // Get updated files list with folders assigned
    const updatedFiles = files.map(f => 
      f.status === "pending" && !f.folder 
        ? { ...f, folder: "commercial-customers" }
        : f
    )

    for (const [index, file] of updatedFiles.entries()) {
      if (file.status === "pending" && file.content && file.folder) {
        setTimeout(async () => {
          setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: "uploading" } : f)))

          try {
            // Upload to backend
            const success = await uploadFileToBackend(file.content!, [file.folder])
            
            if (success) {
              // Get the uploaded document info to get the document ID using the API service
              const { apiService } = await import('@/lib/api')
              const documentsResponse = await apiService.getDocuments()
              
              if (documentsResponse.success && documentsResponse.data) {
                const uploadedDoc = documentsResponse.data.find((d: any) => d.name === file.name)
                
                if (uploadedDoc) {
                  // Start RAG processing asynchronously
                  processDocumentForRAG(uploadedDoc.id)
                  
                  setFiles((prev) => prev.map((f) => 
                    f.id === file.id ? { 
                      ...f, 
                      status: "completed", 
                      progress: 100,
                      documentId: uploadedDoc.id 
                    } : f
                  ))
                }
              }
            } else {
              setFiles((prev) => prev.map((f) => 
                f.id === file.id ? { 
                  ...f, 
                  status: "error", 
                  error: "Upload failed" 
                } : f
              ))
            }
          } catch (error) {
            console.error("Upload error:", error)
            setFiles((prev) => prev.map((f) => 
              f.id === file.id ? { 
                ...f, 
                status: "error", 
                error: "Upload failed" 
              } : f
            ))
          }
        }, index * 500)
      }
    }

    // Show preview after all files are processed
    setTimeout(() => {
      const previews: FilePreview[] = updatedFiles
        .filter(f => f.status === "completed")
        .map((file) => ({
          id: file.documentId || file.id,
          name: file.name,
          folder: file.folder || "commercial-customers",
          accessUsers: getFolderAccessUsers(file.folder || "commercial-customers"),
        }))
      setFilePreviews(previews)
      setShowPreview(true)
    }, updatedFiles.length * 500 + 2000)
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

  const getFolderAccessUsers = (folderId: string): string[] => {
    const folder = mockFolders.find(f => f.id === folderId)
    if (!folder) return ["John Smith (Seller Admin)"]
    
    // Get parent folder to determine access pattern
    const parentFolder = mockFolders.find(f => f.id === folder.parentId)
    const parentName = parentFolder?.name || folder.name
    
    const folderAccess: Record<string, string[]> = {
      "Legal": ["John Smith (Seller Admin)", "Lisa Wang (Company Legal)", "David Brown (Buyer A)"],
      "Commercial": [
        "John Smith (Seller Admin)",
        "Lisa Wang (Company Legal)", 
        "Mike Johnson (Buyer A)",
        "Emma Davis (Buyer B)",
      ],
      "Financial": ["John Smith (Seller Admin)", "Sarah Chen (Company Finance)", "Mike Johnson (Buyer A)"],
      "HR": ["John Smith (Seller Admin)", "Alex Rodriguez (Company HR)", "Mike Johnson (Buyer A)"],
      "IP": ["John Smith (Seller Admin)", "Lisa Wang (Company Legal)", "Tom Wilson (Buyer A)"],
      "IT": ["John Smith (Seller Admin)", "Chris Lee (Company IT)", "David Brown (Buyer A)"],
    }
    return folderAccess[parentName] || ["John Smith (Seller Admin)"]
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
                    {subfolders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4" />
                          {getFolderDisplayName(folder)}
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
              <input 
                type="file" 
                multiple 
                onChange={handleFileSelect} 
                className="hidden" 
                ref={fileInputRef}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer"
                type="button"
              >
                Select Files
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
                          {subfolders.map((folder) => (
                            <SelectItem key={folder.id} value={folder.id}>
                              <div className="flex items-center gap-2">
                                <Folder className="h-3 w-3" />
                                {getFolderDisplayName(folder)}
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
                      <Badge variant="secondary">
                        {(() => {
                          const folder = mockFolders.find(f => f.id === preview.folder)
                          return folder ? getFolderDisplayName(folder) : preview.folder
                        })()}
                      </Badge>
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
