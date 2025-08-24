"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Upload, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface UploadDropzoneProps {
  onUpload: (files: FileList) => void
  className?: string
}

export function UploadDropzone({ onUpload, className }: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      simulateUpload(files)
    }
  }, [])

  const simulateUpload = (files: FileList) => {
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 0
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setUploadProgress(null)
            onUpload(files)
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 100)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      simulateUpload(files)
    }
  }

  if (uploadProgress !== null) {
    return (
      <div className={cn("border-2 border-dashed border-border rounded-lg p-8", className)}>
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 rounded-full p-3">
              <Upload className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Uploading files...</p>
            <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
            <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed border-border rounded-lg p-8 transition-colors",
        isDragOver && "border-primary bg-primary/5",
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-muted rounded-full p-3">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Drop files here</h3>
          <p className="text-sm text-muted-foreground">or click to browse your computer</p>
        </div>
        <div className="flex justify-center">
          <Button variant="outline" className="relative bg-transparent">
            <File className="h-4 w-4 mr-2" />
            Choose Files
            <input
              type="file"
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileInput}
            />
          </Button>
        </div>
      </div>
    </div>
  )
}
