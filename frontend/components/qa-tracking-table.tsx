"use client"

import React from "react"
import { Building } from "lucide-react" // Import Building component

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Search, Filter, ArrowUpDown, ExternalLink, WrapText, Edit, FileText } from "lucide-react"
import { QAProgressBar } from "@/components/qa-progress-bar"
import { AnswerCollapsible } from "@/components/answer-collapsible"
import { cn } from "@/lib/utils"
import type { QATrackingItem } from "@/lib/store"


interface QATrackingTableProps {
  items: QATrackingItem[]
  onItemClick: (item: QATrackingItem) => void
  selectedItemId?: string | null
  isBuySide?: boolean
  onPriorityChange?: (itemId: string, newPriority: "High" | "Medium" | "Low") => void
  onGenerateAnswer?: (questionId: string) => Promise<void>
  onViewDocument?: (documentId: string, highlights?: any[]) => void
  generatingAnswers?: Set<string>
}

export function QATrackingTable({
  items,
  onItemClick,
  selectedItemId,
  isBuySide = false,
  onPriorityChange,
  onGenerateAnswer,
  onViewDocument,
  generatingAnswers = new Set(),
}: QATrackingTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [buyerFilter, setBuyerFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [sortField, setSortField] = useState<keyof QATrackingItem>("submittedDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [wordWrapEnabled, setWordWrapEnabled] = useState(false)
  const [questionColumnWidth, setQuestionColumnWidth] = useState(300)
  const [isResizing, setIsResizing] = useState(false)
  const [editingPriority, setEditingPriority] = useState<string | null>(null)
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set())
  const resizeRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return
    const newWidth = Math.max(200, Math.min(600, e.clientX - (resizeRef.current?.getBoundingClientRect().left || 0)))
    setQuestionColumnWidth(newWidth)
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isResizing])

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "All" || item.status === statusFilter
    const matchesBuyer =
      isBuySide || buyerFilter === "All" || item.buyerId === buyerFilter.toLowerCase().replace(" ", "-")
    const matchesPriority = priorityFilter === "All" || item.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesBuyer && matchesPriority
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    const direction = sortDirection === "asc" ? 1 : -1

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue) * direction
    }
    return 0
  })

  const handleSort = (field: keyof QATrackingItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getStatusBadge = (status: QATrackingItem["status"]) => {
    switch (status) {
      case "Complete":
        return <Badge className="bg-purple-700 text-white">Complete</Badge>
      case "In Progress":
        return <Badge className="bg-purple-400 text-white">In Progress</Badge>
      case "Open":
        return <Badge className="bg-gray-300 text-gray-700 border border-gray-400">Open</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getReviewBadge = (reviewed: QATrackingItem["reviewedByBank"]) => {
    switch (reviewed) {
      case "Yes":
        return <Badge className="bg-secondary text-secondary-foreground">Yes</Badge>
      case "In Progress":
        return <Badge className="bg-primary text-primary-foreground">In Progress</Badge>
      case "Not Started":
        return <Badge variant="outline">Not Started</Badge>
      default:
        return <Badge variant="outline">{reviewed}</Badge>
    }
  }

  const handlePriorityChange = (itemId: string, newPriority: "High" | "Medium" | "Low") => {
    if (onPriorityChange) {
      onPriorityChange(itemId, newPriority)
    }
    setEditingPriority(null)
  }

  const getPriorityBadge = (priority: QATrackingItem["priority"], itemId: string) => {
    if (isBuySide && editingPriority === itemId) {
      return (
        <Select
          value={priority}
          onValueChange={(value: "High" | "Medium" | "Low") => handlePriorityChange(itemId, value)}
        >
          <SelectTrigger className="w-20 h-6">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      )
    }

    const badgeContent = (() => {
      switch (priority) {
        case "High":
          return <Badge className="bg-purple-700 text-white">High</Badge>
        case "Medium":
          return <Badge className="bg-purple-400 text-white">Medium</Badge>
        case "Low":
          return <Badge className="bg-gray-300 text-gray-700 border border-gray-400">Low</Badge>
        default:
          return <Badge variant="outline">{priority}</Badge>
      }
    })()

    if (isBuySide) {
      return (
        <div className="flex items-center gap-1">
          {badgeContent}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              setEditingPriority(itemId)
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      )
    }

    return badgeContent
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatBuyerId = (buyerId: string) => {
    return buyerId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const handleSourceClick = (e: React.MouseEvent, linkedFiles: string[]) => {
    e.stopPropagation() // Prevent row click
    if (linkedFiles.length > 0) {
      const projectId = window.location.pathname.split("/")[2] // Extract project ID from URL
      router.push(`/projects/${projectId}/documents?file=${linkedFiles[0]}`)
    }
  }

  // Calculate progress statistics from filtered items
  const totalQuestions = filteredItems.length
  const completedQuestions = filteredItems.filter(item => item.status === "Complete").length
  const inProgressQuestions = filteredItems.filter(item => item.status === "In Progress").length
  const openQuestions = filteredItems.filter(item => item.status === "Open").length

  return (
    <div className="space-y-4">
      {/* Toolbar */}

      

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Q&A tracking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            variant={wordWrapEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setWordWrapEnabled(!wordWrapEnabled)}
            className="flex items-center gap-2"
          >
            <WrapText className="h-4 w-4" />
            Word Wrap
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {!isBuySide && (
            <Select value={buyerFilter} onValueChange={setBuyerFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Buyer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Buyers</SelectItem>
                <SelectItem value="buyer-a">Buyer A</SelectItem>
                <SelectItem value="buyer-b">Buyer B</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Complete">Complete</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Priority</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Progress Bar */}
      <QAProgressBar
        totalQuestions={totalQuestions}
        completedQuestions={completedQuestions}
        inProgressQuestions={inProgressQuestions}
        openQuestions={openQuestions}
      />

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50">
            <TableRow>
              <TableHead ref={resizeRef} style={{ width: `${questionColumnWidth}px` }} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort("question")}
                >
                  Question
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/40"
                  onMouseDown={handleMouseDown}
                />
              </TableHead>
              {!isBuySide && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold"
                    onClick={() => handleSort("buyerId")}
                  >
                    Buyer
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
              )}
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort("status")}
                >
                  Status
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort("category")}
                >
                  Category
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort("priority")}
                >
                  Priority
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item) => {
              const isExpanded = expandedAnswers.has(item.id)
              const hasAnswer = item.status === "Complete" && (!!item.answer || generatingAnswers.has(item.id))
              
              
              return (
                <React.Fragment key={item.id}>
                  <TableRow
                    className={cn(
                      "cursor-pointer hover:bg-muted/50", 
                      selectedItemId === item.id && "bg-accent",
                      hasAnswer && isExpanded && "border-b-0"
                    )}
                    onClick={() => {
                      if (hasAnswer) {
                        setExpandedAnswers(prev => {
                          const newSet = new Set(prev)
                          if (newSet.has(item.id)) {
                            newSet.delete(item.id)
                          } else {
                            newSet.add(item.id)
                          }
                          return newSet
                        })
                      } else {
                        onItemClick(item)
                      }
                    }}
                  >
                    <TableCell style={{ width: `${questionColumnWidth}px` }}>
                      <div className="flex items-start gap-2">
                        <div className="relative">
                          <MessageSquare className={cn(
                            "h-4 w-4 mt-0.5 flex-shrink-0",
                            hasAnswer ? "text-secondary" : "text-muted-foreground"
                          )} />
                          {hasAnswer && (
                            <div className="absolute -top-1 -right-1 h-2 w-2 bg-secondary rounded-full" />
                          )}
                        </div>
                        <div
                          className={wordWrapEnabled ? "whitespace-normal break-words" : "truncate"}
                          title={item.question}
                        >
                          <span className="font-medium">{item.question}</span>
                          {hasAnswer && (
                            <div className="flex items-center gap-1 mt-1">
                              <Badge 
                                variant={isExpanded ? "default" : "secondary"} 
                                className="text-xs px-2 py-0.5 font-medium"
                              >
                                {isExpanded ? "▼ Hide Answer" : "▶ View Answer"}
                              </Badge>
                              {item.answerSources && item.answerSources.length > 0 && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {item.answerSources.length} source{item.answerSources.length !== 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          )}
                          {item.status === "Open" && (
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5 text-muted-foreground">
                                Awaiting response
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {!isBuySide && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          {formatBuyerId(item.buyerId)}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(item.priority, item.id)}</TableCell>
                  </TableRow>
                  
                  {/* Expandable Answer Row */}
                  {hasAnswer && isExpanded && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={isBuySide ? 4 : 5} className="py-4 px-6">
                        <div className="max-w-4xl">
                          <AnswerCollapsible
                            question={item}
                            onViewDocument={onViewDocument}
                            onGenerateAnswer={onGenerateAnswer}
                            isGenerating={generatingAnswers.has(item.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {sortedItems.length === 0 && (
        <div className="text-center py-8">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Q&A items found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
