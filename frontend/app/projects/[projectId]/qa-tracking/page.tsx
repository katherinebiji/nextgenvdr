"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { QATrackingTable } from "@/components/qa-tracking-table"
import { QuestionDrawer } from "@/components/question-drawer"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { Chatbot } from "@/components/chatbot"
import { DocumentPreviewModal } from "@/components/document-preview-modal"
import { useAppStore } from "@/lib/store"

export default function QATrackingPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [generatingAnswers, setGeneratingAnswers] = useState<Set<string>>(new Set())
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(null)
  const [previewHighlights, setPreviewHighlights] = useState<any[]>([])
  
  const { generateAnswerForQuestion, setQATrackingItems, loadQuestionsFromBackend, qaTrackingItems } = useAppStore()

  const isBuySide = projectId === "project-valley"

  const selectedItem = selectedItemId ? qaTrackingItems.find((item) => item.id === selectedItemId) : null

  const handleItemClick = (item: any) => {
    setSelectedItemId(item.id)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setSelectedItemId(null)
  }

  // Load questions from backend on component mount
  useEffect(() => {
    loadQuestionsFromBackend()
  }, [loadQuestionsFromBackend])

  const handlePriorityChange = (itemId: string, newPriority: "High" | "Medium" | "Low") => {
    // Update priority in store
    const updatedItems = qaTrackingItems.map((item) => 
      item.id === itemId ? { ...item, priority: newPriority } : item
    )
    setQATrackingItems(updatedItems)
  }

  const handleGenerateAnswer = async (questionId: string) => {
    setGeneratingAnswers(prev => new Set(prev).add(questionId))
    try {
      await generateAnswerForQuestion(questionId)
      // Reload the questions to get the updated answer from the backend
      await loadQuestionsFromBackend()
    } catch (error) {
      console.error("Failed to generate answer:", error)
    } finally {
      setGeneratingAnswers(prev => {
        const newSet = new Set(prev)
        newSet.delete(questionId)
        return newSet
      })
    }
  }

  const handleViewDocument = (documentId: string, highlights?: any[]) => {
    setPreviewDocumentId(documentId)
    setPreviewHighlights(highlights || [])
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <BreadcrumbNav
          items={[
            { label: "Projects", href: "/projects" },
            { label: isBuySide ? "Project Valley" : "TechCorp Acquisition", href: `/projects/${projectId}` },
            { label: "Q&A Tracking" },
          ]}
        />
        <div className="mt-2">
          <h1 className="text-2xl font-semibold">Q&A Tracking</h1>
          <p className="text-muted-foreground">
            {isBuySide
              ? "Track your due diligence questions and responses from the seller"
              : "Track buyer questions and seller responses across all categories"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <QATrackingTable
          items={qaTrackingItems}
          onItemClick={handleItemClick}
          selectedItemId={selectedItemId}
          isBuySide={isBuySide}
          onPriorityChange={handlePriorityChange}
          onGenerateAnswer={handleGenerateAnswer}
          onViewDocument={handleViewDocument}
          generatingAnswers={generatingAnswers}
        />
      </div>

      {/* Question Drawer */}
      {selectedItem && (
        <QuestionDrawer 
          item={selectedItem} 
          isOpen={isDrawerOpen} 
          onClose={handleDrawerClose}
          onGenerateAnswer={handleGenerateAnswer}
          onViewDocument={handleViewDocument}
          isGeneratingAnswer={generatingAnswers.has(selectedItem.id)}
        />
      )}
      
      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewDocumentId}
        onClose={() => {
          setPreviewDocumentId(null)
          setPreviewHighlights([])
        }}
        documentId={previewDocumentId || ""}
        highlightChunks={previewHighlights}
        title="Source Document"
      />
      
      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}
