"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, MessageSquare, Calendar, User, Building, Brain } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Question, CategorySuggestion } from "@/lib/store"

interface QnAListProps {
  questions: Question[]
  categorySuggestions: CategorySuggestion[]
  onQuestionClick: (question: Question) => void
  selectedQuestionId?: string | null
}

export function QnAList({ questions, categorySuggestions, onQuestionClick, selectedQuestionId }: QnAListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [buyerFilter, setBuyerFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      !searchQuery ||
      question.requestedItem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBuyer = buyerFilter === "All" || question.buyerId === buyerFilter.toLowerCase().replace(" ", "-")
    const matchesStatus = statusFilter === "All" || question.status === statusFilter
    const matchesPriority = priorityFilter === "All" || question.priority === priorityFilter

    return matchesSearch && matchesBuyer && matchesStatus && matchesPriority
  })

  const getStatusBadge = (status: Question["status"]) => {
    switch (status) {
      case "Answered":
        return <Badge className="bg-secondary text-secondary-foreground">Answered</Badge>
      case "In Progress":
        return <Badge className="bg-primary text-primary-foreground">In Progress</Badge>
      case "Open":
        return <Badge variant="outline">Open</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: Question["priority"]) => {
    switch (priority) {
      case "High":
        return <Badge variant="destructive">High</Badge>
      case "Medium":
        return <Badge className="bg-primary text-primary-foreground">Medium</Badge>
      case "Low":
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getCategorySuggestion = (questionId: string) => {
    return categorySuggestions.find((cs) => cs.questionId === questionId)
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

  return (
    <div className="space-y-4">
      {/* Filter Rail */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Answered">Answered</SelectItem>
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

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((question) => {
          const suggestion = getCategorySuggestion(question.id)
          const isSelected = selectedQuestionId === question.id

          return (
            <Card
              key={question.id}
              className={cn("cursor-pointer hover:shadow-md transition-shadow", isSelected && "ring-2 ring-primary")}
              onClick={() => onQuestionClick(question)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-base">{question.requestedItem}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{formatBuyerId(question.buyerId)}</span>
                      </div>
                      {getPriorityBadge(question.priority)}
                      {getStatusBadge(question.status)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Due {formatDate(question.dueDate)}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <CardDescription className="text-sm">{question.description}</CardDescription>

                {/* AI Category */}
                {suggestion && (
                  <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-md">
                    <Brain className="h-4 w-4 text-primary" />
                    <Badge className="bg-secondary text-secondary-foreground text-xs">
                      {suggestion.suggestion.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(suggestion.suggestion.confidence * 100)}% confidence
                    </span>
                  </div>
                )}

                {/* Team Assignment */}
                {question.team && (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Assigned to {question.team}</span>
                  </div>
                )}

                {/* Linked Files */}
                {question.linkedFiles && question.linkedFiles.length > 0 && (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {question.linkedFiles.length} linked document{question.linkedFiles.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-8">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No questions found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
