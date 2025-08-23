"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDocumentQuestionRouter } from "./document-question-router"
import type { Document } from "./document-provider"
import { MessageSquare, User, Calendar, AlertCircle, Clock, Zap } from "lucide-react"

interface DocumentRelatedQuestionsProps {
  document: Document
}

export function DocumentRelatedQuestions({ document }: DocumentRelatedQuestionsProps) {
  const { findQuestionsForDocument } = useDocumentQuestionRouter()

  const relatedQuestions = findQuestionsForDocument(document)

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

  if (relatedQuestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Related Questions
          </CardTitle>
          <CardDescription>Questions that might be answered by this document</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-slate-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No related questions found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Related Questions ({relatedQuestions.length})
        </CardTitle>
        <CardDescription>Questions that might be answered by this document</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relatedQuestions.map((question) => (
            <div key={question.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 mb-1">{question.title}</h4>
                  <p className="text-slate-600 text-sm line-clamp-2">{question.content}</p>
                </div>
                <div className="flex flex-col gap-1 ml-4">
                  <Badge className={`text-xs ${getStatusColor(question.status)}`}>
                    {question.status.replace("_", " ")}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {getPriorityIcon(question.priority)}
                    <span className="text-xs text-slate-500 capitalize">{question.priority}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {question.askedBy}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {question.askedAt.toLocaleDateString()}
                </span>
              </div>

              {question.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {question.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {question.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{question.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
