"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SmartQuestionView } from "./smart-question-view"
import { useQuestions, type QuestionStatus } from "./question-provider"
import { useAuth } from "./auth-provider"
import { MessageSquare, Search, Calendar, User, AlertCircle, Clock, Zap, CheckCircle, FileX, Eye } from "lucide-react"

export function QuestionList() {
  const { questions, markNeedsDocuments } = useQuestions()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<QuestionStatus | "all">("all")
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.tags.some((tag) => tag.includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || question.status === statusFilter

    const matchesRole = user?.role === "seller" || question.askedBy === user?.name

    return matchesSearch && matchesStatus && matchesRole
  })

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case "medium":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "low":
        return <Zap className="w-4 h-4 text-green-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusIcon = (status: QuestionStatus) => {
    switch (status) {
      case "answered":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "needs_documents":
        return <FileX className="w-4 h-4 text-orange-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-blue-600" />
      default:
        return <Clock className="w-4 h-4 text-blue-600" />
    }
  }

  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case "answered":
        return "bg-green-100 text-green-800 border-green-200"
      case "needs_documents":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  if (selectedQuestion) {
    const question = questions.find((q) => q.id === selectedQuestion)
    if (question) {
      return (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setSelectedQuestion(null)} className="mb-4">
            ← Back to Questions
          </Button>
          <SmartQuestionView question={question} onMarkNeedsDocuments={markNeedsDocuments} />
        </div>
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {user?.role === "seller" ? "All Questions" : "My Questions"}
        </CardTitle>
        <CardDescription>
          {user?.role === "seller"
            ? "Questions from buyers requiring your attention"
            : "Track your submitted questions"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as QuestionStatus | "all")}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="answered">Answered</SelectItem>
              <SelectItem value="needs_documents">Needs Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Question List */}
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{questions.length === 0 ? "No questions submitted yet" : "No questions match your filters"}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <div key={question.id} className="border border-slate-200 rounded-lg p-6 hover:bg-slate-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-2">{question.title}</h4>
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">{question.content}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {question.askedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {question.askedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Badge className={`flex items-center gap-1 ${getStatusColor(question.status)}`}>
                      {getStatusIcon(question.status)}
                      {question.status.replace("_", " ")}
                    </Badge>
                    <Badge className={`flex items-center gap-1 ${getPriorityColor(question.priority)}`}>
                      {getPriorityIcon(question.priority)}
                      {question.priority}
                    </Badge>
                  </div>
                </div>

                {question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {question.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {question.answer && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-900">Answer</span>
                      <span className="text-sm text-green-700">by {question.answeredBy}</span>
                    </div>
                    <p className="text-green-800 text-sm">{question.answer}</p>
                    {question.answeredAt && (
                      <p className="text-xs text-green-600 mt-2">
                        Answered on {question.answeredAt.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedQuestion(question.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  {user?.role === "seller" && question.status === "pending" && (
                    <Button size="sm" variant="outline" onClick={() => markNeedsDocuments(question.id)}>
                      Mark Needs Documents
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
