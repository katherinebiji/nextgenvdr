"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, X, HelpCircle, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "pending" | "processing" | "completed"
}

export function UploadQuestions() {
  const [textQuestions, setTextQuestions] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    const acceptedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ]

    const validFiles = files.filter((file) => acceptedTypes.includes(file.type))

    const newFiles: UploadedFile[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending",
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄"
    if (type.includes("word")) return "📝"
    if (type.includes("excel") || type.includes("sheet")) return "📊"
    return "📄"
  }

  const handleSubmit = () => {
    // Process text questions and uploaded files
    console.log("[v0] Submitting questions:", { textQuestions, uploadedFiles })

    // Update file status to processing
    setUploadedFiles((prev) => prev.map((file) => ({ ...file, status: "processing" })))

    // Simulate processing
    setTimeout(() => {
      setUploadedFiles((prev) => prev.map((file) => ({ ...file, status: "completed" })))
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Text Questions Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Enter Questions Directly
          </CardTitle>
          <CardDescription>Type your due diligence questions directly into the text area below</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter your questions here, one per line or separated by paragraphs..."
            value={textQuestions}
            onChange={(e) => setTextQuestions(e.target.value)}
            className="min-h-[200px] resize-none"
          />
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">{textQuestions.length} characters</p>
            <Button
              onClick={handleSubmit}
              disabled={!textQuestions.trim() && uploadedFiles.length === 0}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Submit Questions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Question Files
          </CardTitle>
          <CardDescription>Upload Excel, PDF, or Word documents containing your questions</CardDescription>
        </CardHeader>
        <CardContent>
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
            <p className="text-sm text-muted-foreground mb-4">
              Supports: Excel (.xlsx, .xls), PDF (.pdf), Word (.docx, .doc), Text (.txt)
            </p>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <FileText className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".xlsx,.xls,.pdf,.docx,.doc,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Uploaded Files ({uploadedFiles.length})</h4>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          file.status === "completed"
                            ? "default"
                            : file.status === "processing"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {file.status === "completed" && "✓ "}
                        {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        disabled={file.status === "processing"}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
