"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Search, Filter, Upload, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FolderTree } from "@/components/folder-tree"
import { FileList } from "@/components/file-list"
import { UploadDropzone } from "@/components/upload-dropzone"
import { RelevancePanel } from "@/components/relevance-panel"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { useAppStore } from "@/lib/store"
import { mockFolders, mockFiles, mockQuestions } from "@/lib/mock-data"

export default function DocumentsPage() {
  const params = useParams()
  const {
    selectedFolder,
    selectedFile,
    showRelevancePanel,
    currentRelevance,
    buyerFilter,
    setSelectedFolder,
    setSelectedFile,
    setShowRelevancePanel,
    setCurrentRelevance,
    setBuyerFilter,
    addFile,
    updateFileVisibility,
  } = useAppStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [showUpload, setShowUpload] = useState(false)

  // Initialize mock data
  useEffect(() => {
    // In a real app, this would fetch data based on projectId
  }, [params.projectId])

  const currentFolder = mockFolders.find((f) => f.id === selectedFolder)
  const filteredFiles = mockFiles.filter((file) => {
    const matchesFolder = !selectedFolder || file.folderId === selectedFolder
    const matchesSearch = !searchQuery || file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBuyer =
      buyerFilter === "All" ||
      file.visibleTo === "All" ||
      (Array.isArray(file.visibleTo) && file.visibleTo.includes(buyerFilter))

    return matchesFolder && matchesSearch && matchesBuyer
  })

  const handleUpload = (files: FileList) => {
    // Mock AI relevance analysis
    const file = files[0]
    const mockRelevance = {
      filename: file.name,
      relevantQuestionIds: ["q-1", "q-2"],
      targetPath: currentFolder?.path || "/Legal/Corporate Organization",
      confidence: 0.85,
      rename: file.name.replace(/\.[^/.]+$/, "_clean.pdf"),
      irrelevant: false,
    }

    setCurrentRelevance(mockRelevance)
    setShowRelevancePanel(true)
    setShowUpload(false)
  }

  const handleAcceptRelevance = (suggestion: any) => {
    // Add file to store
    const newFile = {
      id: `file-${Date.now()}`,
      name: suggestion.rename,
      path: `${suggestion.targetPath}/${suggestion.rename}`,
      folderId: selectedFolder || "legal-corp",
      size: 1234567,
      modified: new Date().toISOString(),
      version: "1.0",
      visibleTo: "All" as const,
      type: "pdf",
      uploadedBy: "Current User",
    }

    addFile(newFile)
    setShowRelevancePanel(false)
    setCurrentRelevance(null)
  }

  const handleOverrideRelevance = (suggestion: any) => {
    handleAcceptRelevance(suggestion)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col gap-2">
            <BreadcrumbNav />
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Documents</h1>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={buyerFilter} onValueChange={setBuyerFilter}>
              <SelectTrigger className="w-40">
                <Users className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Buyers</SelectItem>
                <SelectItem value="Buyer A">Buyer A</SelectItem>
                <SelectItem value="Buyer B">Buyer B</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>

            <Button onClick={() => setShowUpload(!showUpload)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Folder Tree */}
        <div className="w-80 border-r border-border bg-card">
          <FolderTree
            folders={mockFolders}
            files={mockFiles}
            onFolderSelect={setSelectedFolder}
            selectedFolderId={selectedFolder}
          />
        </div>

        {/* Center - File List */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {showUpload && (
            <div className="p-4 border-b border-border">
              <UploadDropzone onUpload={handleUpload} />
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <FileList
              files={filteredFiles}
              selectedFileId={selectedFile}
              onFileSelect={setSelectedFile}
              onFileVisibilityChange={updateFileVisibility}
            />
          </div>
        </div>

        {/* Right Sidebar - Relevance Panel */}
        {showRelevancePanel && currentRelevance && (
          <RelevancePanel
            suggestion={currentRelevance}
            questions={mockQuestions}
            onAccept={handleAcceptRelevance}
            onOverride={handleOverrideRelevance}
            onClose={() => setShowRelevancePanel(false)}
          />
        )}
      </div>
    </div>
  )
}
