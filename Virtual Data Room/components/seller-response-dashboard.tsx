"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuestions } from "./question-provider"
import { useDocuments } from "./document-provider"
import { QuestionResponseForm } from "./question-response-form"
import { QuestionDocumentSuggestions } from "./question-document-suggestions"
import { MessageSquare, Clock, AlertTriangle, CheckCircle, FileX, Calendar, User, AlertCircle, Zap } from "lucide-react"

export function SellerResponseDashboard() {
  const { questions, getQuestionsByStatus } = useQuestions()
  const { documents } = useDocuments()
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)

  const pendingQuestions = getQuestionsByStatus("pending")
  const answeredQuestions = getQuestionsByStatus("answered")
  const needsDocumentsQuestions = getQuestionsByStatus("needs_documents")

  // Sort questions by priority and date
  const sortQuestionsByPriority = (questions: any[]) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return questions.sort((a, b) => {
      const priorityDiff =
        priorityOrder[b.priority as keyof typeof priorityOrder] -
        priorityOrder[a.priority as keyof typeof priorityOrder]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime()
    })
  }

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

  const getUrgencyLabel = (question: any) => {
    const hoursAgo = (Date.now() - new Date(question.askedAt).getTime()) / (1000 * 60 * 60)
    if (question.priority === "high" && hoursAgo > 4) return "Overdue"
    if (question.priority === "medium" && hoursAgo > 24) return "Due Soon"
    if (hoursAgo > 72) return "Aging"
    return null
  }

  const getUrgencyColor = (urgency: string | null) => {
    switch (urgency) {
      case "Overdue":
        return "bg-red-500 text-white"
      case "Due Soon":
        return "bg-orange-500 text-white"
      case "Aging":
        return "bg-yellow-500 text-white"
      default:
        return ""
    }
  }

  const selectedQuestion = selectedQuestionId ? questions.find((q) => q.id === selectedQuestionId) : null

  if (selectedQuestion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedQuestionId(null)}>
            ← Back to Dashboard
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Responding to Question</h2>
            <p className="text-slate-600">Provide a comprehensive answer with supporting documents</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Question Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{selectedQuestion.title}</CardTitle>
                    <CardDescription className="text-base">{selectedQuestion.content}</CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Badge className={`flex items-center gap-1 ${getPriorityColor(selectedQuestion.priority)}`}>
                      {getPriorityIcon(selectedQuestion.priority)}
                      {selectedQuestion.priority}
                    </Badge>
                    {getUrgencyLabel(selectedQuestion) && (
                      <Badge className={getUrgencyColor(getUrgencyLabel(selectedQuestion))}>
                        {getUrgencyLabel(selectedQuestion)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Asked by {selectedQuestion.askedBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {selectedQuestion.askedAt.toLocaleDateString()}
                  </span>
                </div>

                {selectedQuestion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedQuestion.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Response Form */}
            <QuestionResponseForm question={selectedQuestion} onComplete={() => setSelectedQuestionId(null)} />
          </div>

          <div>
            {/* Document Suggestions */}
            <QuestionDocumentSuggestions question={selectedQuestion} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Response Dashboard</h2>
        <p className="text-slate-600">Manage and respond to buyer questions efficiently</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-5 h-5" />
              Urgent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {pendingQuestions.filter((q) => q.priority === "high").length}
            </div>
            <CardDescription className="text-red-700">High priority questions</CardDescription>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Clock className="w-5 h-5" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{pendingQuestions.length}</div>
            <CardDescription className="text-blue-700">Awaiting response</CardDescription>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <FileX className="w-5 h-5" />
              Needs Docs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{needsDocumentsQuestions.length}</div>
            <CardDescription className="text-orange-700">Requires documentation</CardDescription>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="w-5 h-5" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{answeredQuestions.length}</div>
            <CardDescription className="text-green-700">Questions answered</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Question Management Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingQuestions.length})
          </TabsTrigger>
          <TabsTrigger value="needs-docs" className="flex items-center gap-2">
            <FileX className="w-4 h-4" />
            Needs Docs ({needsDocumentsQuestions.length})
          </TabsTrigger>
          <TabsTrigger value="answered" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Answered ({answeredQuestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Questions</CardTitle>
              <CardDescription>Questions requiring your immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingQuestions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending questions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortQuestionsByPriority(pendingQuestions).map((question) => {
                    const urgency = getUrgencyLabel(question)
                    return (
                      <div
                        key={question.id}
                        className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelectedQuestionId(question.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-1">{question.title}</h4>
                            <p className="text-slate-600 text-sm line-clamp-2">{question.content}</p>
                          </div>
                          <div className="flex flex-col gap-1 ml-4">
                            <Badge className={`flex items-center gap-1 ${getPriorityColor(question.priority)}`}>
                              {getPriorityIcon(question.priority)}
                              {question.priority}
                            </Badge>
                            {urgency && <Badge className={getUrgencyColor(urgency)}>{urgency}</Badge>}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
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
                          <Button size="sm" variant="outline">
                            Respond
                          </Button>
                        </div>

                        {question.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
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
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="needs-docs">
          <Card>
            <CardHeader>
              <CardTitle>Questions Needing Documentation</CardTitle>
              <CardDescription>Questions marked as requiring additional documents</CardDescription>
            </CardHeader>
            <CardContent>
              {needsDocumentsQuestions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileX className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No questions need additional documentation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {needsDocumentsQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="border border-orange-200 rounded-lg p-4 bg-orange-50/30 hover:bg-orange-50 cursor-pointer"
                      onClick={() => setSelectedQuestionId(question.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{question.title}</h4>
                          <p className="text-slate-600 text-sm line-clamp-2">{question.content}</p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          <FileX className="w-3 h-3 mr-1" />
                          Needs Docs
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
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
                        <Button size="sm" variant="outline">
                          Upload Documents
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="answered">
          <Card>
            <CardHeader>
              <CardTitle>Answered Questions</CardTitle>
              <CardDescription>Questions you have successfully responded to</CardDescription>
            </CardHeader>
            <CardContent>
              {answeredQuestions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No questions answered yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {answeredQuestions.map((question) => (
                    <div key={question.id} className="border border-green-200 rounded-lg p-4 bg-green-50/30">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{question.title}</h4>
                          <p className="text-slate-600 text-sm line-clamp-1">{question.content}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Answered
                        </Badge>
                      </div>

                      {question.answer && (
                        <div className="bg-green-100 border border-green-200 rounded p-3 mb-3">
                          <p className="text-green-800 text-sm">{question.answer}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Asked by {question.askedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Answered {question.answeredAt?.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
