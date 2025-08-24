"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { X, FileText, Calendar, User, Building, CheckCircle, Clock, AlertCircle, Link } from "lucide-react"
import { AnswerCollapsible } from "@/components/answer-collapsible"
import type { TrackerItem, CategorySuggestion, File, QATrackingItem } from "@/lib/store"

interface QuestionDrawerProps {
  item: TrackerItem | QATrackingItem | null
  isOpen: boolean
  onClose: () => void
  categorySuggestion?: CategorySuggestion
  linkedFiles?: File[]
  onAcceptCategory?: (category: string, subcategory: string) => void
  onAssignTeam?: (team: string) => void
  onUpdateReviewStatus?: (status: TrackerItem["reviewedByBank"]) => void
  onGenerateAnswer?: (questionId: string) => Promise<void>
  onViewDocument?: (documentId: string, highlights?: any[]) => void
  isGeneratingAnswer?: boolean
}

export function QuestionDrawer({
  item,
  isOpen,
  onClose,
  categorySuggestion,
  linkedFiles = [],
  onAcceptCategory,
  onAssignTeam,
  onUpdateReviewStatus,
  onGenerateAnswer,
  onViewDocument,
  isGeneratingAnswer = false,
}: QuestionDrawerProps) {
  const [selectedTeam, setSelectedTeam] = useState(item?.team || "")
  const [selectedReviewStatus, setSelectedReviewStatus] = useState(item?.reviewedByBank || "Not Started")

  if (!item) return null

  const isQATrackingItem = (item: any): item is QATrackingItem => {
    return 'question' in item
  }

  const getStatusIcon = (status: TrackerItem["status"] | QATrackingItem["status"]) => {
    switch (status) {
      case "Complete":
        return <CheckCircle className="h-4 w-4 text-secondary" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-primary" />
      case "Open":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: TrackerItem["priority"]) => {
    switch (priority) {
      case "High":
        return "text-destructive"
      case "Medium":
        return "text-primary"
      case "Low":
        return "text-muted-foreground"
      default:
        return "text-muted-foreground"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-xl">
                {isQATrackingItem(item) ? item.question : item.indexLink}
              </SheetTitle>
              <SheetDescription className="text-base">
                {isQATrackingItem(item) ? item.description : item.requestedItem}
              </SheetDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {getStatusIcon(item.status)}
            <Badge variant="outline">{item.status}</Badge>
            <Badge className={getPriorityColor(item.priority)} variant="outline">
              {item.priority} Priority
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* AI Category Suggestion */}
          {categorySuggestion && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="bg-primary rounded-full p-1">
                    <CheckCircle className="h-3 w-3 text-primary-foreground" />
                  </div>
                  AI Category Suggestion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-secondary text-secondary-foreground">
                      {categorySuggestion.suggestion.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground ml-2">
                      / {categorySuggestion.suggestion.subcategory}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-primary">
                    {Math.round(categorySuggestion.suggestion.confidence * 100)}% confidence
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Alternatives:</p>
                  <div className="flex gap-2">
                    {categorySuggestion.suggestion.alternatives.map((alt, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {alt}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      onAcceptCategory?.(
                        categorySuggestion.suggestion.category,
                        categorySuggestion.suggestion.subcategory,
                      )
                    }
                  >
                    Accept
                  </Button>
                  <Button size="sm" variant="outline">
                    Override
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(item.dueDate)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {isQATrackingItem(item) ? "Category" : "Folder Path"}
                </label>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono">
                    {isQATrackingItem(item) ? `${item.category} / ${item.subcategory}` : item.folderPath}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-sm bg-muted p-3 rounded-md">{item.description}</p>
            </div>
          </div>

          {/* Answer Section for QA Tracking Items */}
          {isQATrackingItem(item) && (
            <div className="space-y-3">
              <h3 className="font-semibold">Answer</h3>
              <AnswerCollapsible
                question={item}
                onViewDocument={onViewDocument}
                onGenerateAnswer={onGenerateAnswer}
                isGenerating={isGeneratingAnswer}
              />
            </div>
          )}

          {/* Team Assignment */}
          <div className="space-y-3">
            <h3 className="font-semibold">Team Assignment</h3>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Assign team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Seller">Seller</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Tax">Tax</SelectItem>
              </SelectContent>
            </Select>
            {selectedTeam !== item.team && (
              <Button size="sm" onClick={() => onAssignTeam?.(selectedTeam)}>
                Update Team Assignment
              </Button>
            )}
          </div>

          {/* Bank Review Status */}
          <div className="space-y-3">
            <h3 className="font-semibold">Bank Review Status</h3>
            <Select value={selectedReviewStatus} onValueChange={setSelectedReviewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
              </SelectContent>
            </Select>
            {selectedReviewStatus !== item.reviewedByBank && (
              <Button
                size="sm"
                onClick={() => onUpdateReviewStatus?.(selectedReviewStatus as TrackerItem["reviewedByBank"])}
              >
                Update Review Status
              </Button>
            )}
          </div>

          {/* Linked Files */}
          {linkedFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Linked Documents</h3>
              <div className="space-y-2">
                {linkedFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-2 bg-muted rounded-md">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.path}</p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Link className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          <div className="space-y-3">
            <h3 className="font-semibold">History</h3>
            <div className="space-y-3">
              {item.history.map((entry, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{entry.action}</span>
                      <span className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{entry.user}</span>
                    </div>
                    {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
