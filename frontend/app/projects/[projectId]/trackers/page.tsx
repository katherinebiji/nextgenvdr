"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { TrackerTable } from "@/components/tracker-table"
import { QuestionDrawer } from "@/components/question-drawer"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { useAppStore, type TrackerItem } from "@/lib/store"
import { mockTrackerItems, mockCategorySuggestions, mockFiles } from "@/lib/mock-data"

export default function TrackersPage() {
  const params = useParams()
  const { selectedTracker, setSelectedTracker } = useAppStore()
  const [selectedItem, setSelectedItem] = useState<TrackerItem | null>(null)

  const handleItemClick = (item: TrackerItem) => {
    setSelectedItem(item)
    setSelectedTracker(item.id)
  }

  const handleCloseDrawer = () => {
    setSelectedItem(null)
    setSelectedTracker(null)
  }

  const getCategorySuggestion = (questionId?: string) => {
    if (!questionId) return undefined
    return mockCategorySuggestions.find((cs) => cs.questionId === questionId)
  }

  const getLinkedFiles = (item: TrackerItem) => {
    // Mock linked files based on folder path
    return mockFiles.filter((file) => file.path.startsWith(item.folderPath))
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col gap-2">
            <BreadcrumbNav />
            <div>
              <h1 className="text-xl font-semibold">Trackers</h1>
              <p className="text-sm text-muted-foreground">Seller checklist and progress tracking</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6">
        <TrackerTable items={mockTrackerItems} onItemClick={handleItemClick} selectedItemId={selectedTracker} />
      </div>

      {/* Question Drawer */}
      <QuestionDrawer
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={handleCloseDrawer}
        categorySuggestion={getCategorySuggestion(selectedItem?.questionId)}
        linkedFiles={selectedItem ? getLinkedFiles(selectedItem) : []}
        onAcceptCategory={(category, subcategory) => {
          console.log("Accept category:", category, subcategory)
        }}
        onAssignTeam={(team) => {
          console.log("Assign team:", team)
        }}
        onUpdateReviewStatus={(status) => {
          console.log("Update review status:", status)
        }}
      />
    </div>
  )
}
