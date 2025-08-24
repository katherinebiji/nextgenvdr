"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Loader2, Eye, EyeOff } from "lucide-react"
import { useAppStore } from "@/lib/store"

interface DocumentPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
  highlightChunks?: Array<{
    chunk_id: string
    start_position: number
    end_position: number
    content: string
  }>
  title?: string
}

interface DocumentPreview {
  document_id: string
  document_name: string
  document_type: string
  text_content: string
  chunks: Array<{
    chunk_id: string
    content: string
    chunk_index: number
    start_position: number
    end_position: number
    chunk_length: number
  }>
  processing_status: string
}

export function DocumentPreviewModal({ 
  isOpen, 
  onClose, 
  documentId, 
  highlightChunks = [],
  title 
}: DocumentPreviewModalProps) {
  const [preview, setPreview] = useState<DocumentPreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [showHighlights, setShowHighlights] = useState(true)
  const { getDocumentPreview, downloadFile } = useAppStore()

  useEffect(() => {
    if (isOpen && documentId) {
      loadPreview()
    }
  }, [isOpen, documentId])

  const loadPreview = async () => {
    setLoading(true)
    try {
      const previewData = await getDocumentPreview(documentId)
      setPreview(previewData)
    } catch (error) {
      console.error("Failed to load document preview:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      await downloadFile(documentId)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const renderHighlightedText = (text: string) => {
    if (!showHighlights || highlightChunks.length === 0) {
      return text
    }

    let highlightedText = text
    let offset = 0

    // Sort chunks by start position to avoid overlapping highlights
    const sortedChunks = [...highlightChunks].sort((a, b) => a.start_position - b.start_position)

    sortedChunks.forEach((chunk, index) => {
      const start = chunk.start_position + offset
      const end = chunk.end_position + offset
      
      if (start >= 0 && end <= highlightedText.length) {
        const beforeText = highlightedText.substring(0, start)
        const highlightText = highlightedText.substring(start, end)
        const afterText = highlightedText.substring(end)
        
        const highlightSpan = `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded" data-chunk-id="${chunk.chunk_id}">${highlightText}</mark>`
        
        highlightedText = beforeText + highlightSpan + afterText
        offset += highlightSpan.length - highlightText.length
      }
    })

    return highlightedText
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {title || preview?.document_name || "Document Preview"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHighlights(!showHighlights)}
                className="flex items-center gap-1"
              >
                {showHighlights ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showHighlights ? "Hide" : "Show"} Highlights
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
          
          {preview && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{preview.document_type}</Badge>
              <Separator orientation="vertical" className="h-4" />
              <span>Processing: {preview.processing_status}</span>
              {highlightChunks.length > 0 && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{highlightChunks.length} relevant sections</span>
                </>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : preview ? (
            <ScrollArea className="h-full">
              <div className="space-y-4 p-4">
                {preview.processing_status !== "completed" && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm font-medium">
                        Document is being processed for search...
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      RAG processing status: {preview.processing_status}
                    </p>
                  </div>
                )}
                
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {preview.text_content ? (
                    <div 
                      className="whitespace-pre-wrap font-mono text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: renderHighlightedText(preview.text_content) 
                      }}
                    />
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Text content not available for this document type</p>
                      <p className="text-xs">Some document formats may not support text extraction</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Failed to load document preview</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}