"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { QATrackingTable } from "@/components/qa-tracking-table"
import { QuestionDrawer } from "@/components/question-drawer"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { mockQATrackingItems } from "@/lib/mock-data"

export default function QATrackingPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [qaItems, setQaItems] = useState(mockQATrackingItems)

  const isBuySide = projectId === "project-valley"

  const selectedItem = selectedItemId ? qaItems.find((item) => item.id === selectedItemId) : null

  const handleItemClick = (item: any) => {
    setSelectedItemId(item.id)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setSelectedItemId(null)
  }

  const handlePriorityChange = (itemId: string, newPriority: "High" | "Medium" | "Low") => {
    setQaItems((prevItems) => prevItems.map((item) => (item.id === itemId ? { ...item, priority: newPriority } : item)))
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
          items={qaItems}
          onItemClick={handleItemClick}
          selectedItemId={selectedItemId}
          isBuySide={isBuySide}
          onPriorityChange={handlePriorityChange}
        />
      </div>

      {/* Question Drawer */}
      {selectedItem && <QuestionDrawer question={selectedItem} isOpen={isDrawerOpen} onClose={handleDrawerClose} />}
    </div>
  )
}
