"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QuestionDocumentSuggestions } from "./question-document-suggestions"
import type { Question } from "./question-provider"
import { useAuth } from "./auth-provider"
import { MessageSquare, User, Calendar, AlertCircle, Clock, Zap, CheckCircle, FileX, Lightbulb } from "lucide-react"

interface SmartQuestionViewProps {
  question: Question
  onAnswer?: (questionId: string, answer: string, relatedDocuments: string[]) => void
  onMarkNeedsDocuments?: (questionId: string) => void
}

export function SmartQuestionView({ question, onAnswer, onMarkNeedsDocuments }: SmartQuestionViewProps) {
  const { user } = useAuth()
  const [showSuggestions, setShowSuggestions] = useState(false)

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

  const getStatusIcon = (status: string) => {
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

  const getStatusColor = (status: string) => {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5" />
                {question.title}
              </CardTitle>
              <CardDescription className="text-base">{question.content}</CardDescription>
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
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              Asked by {question.askedBy}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {question.askedAt.toLocaleDateString()}
            </span>
          </div>

          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
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
                <p className="text-xs text-green-600 mt-2">Answered on {question.answeredAt.toLocaleDateString()}</p>
              )}
            </div>
          )}

          {user?.role === "seller" && question.status === "pending" && (
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowSuggestions(!showSuggestions)}>
                <Lightbulb className="w-4 h-4 mr-2" />
                {showSuggestions ? "Hide" : "Show"} Document Suggestions
              </Button>
              {onAnswer && (
                <Button size="sm" variant="outline">
                  Answer Question
                </Button>
              )}
              {onMarkNeedsDocuments && (
                <Button size="sm" variant="outline" onClick={() => onMarkNeedsDocuments(question.id)}>
                  Mark Needs Documents
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showSuggestions && <QuestionDocumentSuggestions question={question} />}
    </div>
  )
}
