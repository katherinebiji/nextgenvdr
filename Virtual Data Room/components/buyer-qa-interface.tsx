"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QuestionForm } from "./question-form"
import { useQuestions, type QuestionStatus } from "./question-provider"
import { useAuth } from "./auth-provider"
import { MessageSquare, Search, Plus, Clock, CheckCircle, FileX, Calendar, AlertCircle, Zap, Eye } from "lucide-react"

export function BuyerQAInterface() {
  const { questions } = useQuestions()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<QuestionStatus | "all">("all")
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [showQuestionForm, setShowQuestionForm] = useState(false)

  // Filter questions for current buyer
  const userQuestions = questions.filter((q) => q.askedBy === user?.name)

  const filteredQuestions = userQuestions.filter((question) => {
    const matchesSearch =
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.tags.some((tag) => tag.includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || question.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const pendingQuestions = userQuestions.filter((q) => q.status === "pending")
  const answeredQuestions = userQuestions.filter((q) => q.status === "answered")
  const needsDocumentsQuestions = userQuestions.filter((q) => q.status === "needs_documents")

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

  const selectedQuestion = selectedQuestionId ? userQuestions.find((q) => q.id === selectedQuestionId) : null

  if (showQuestionForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowQuestionForm(false)}>
            ← Back to Q&A
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Ask a New Question</h2>
            <p className="text-slate-600">Submit a question to get information from sellers</p>
          </div>
        </div>
        <QuestionForm />
      </div>
    )
  }

  if (selectedQuestion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedQuestionId(null)}>
            ← Back to Questions
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Question Details</h2>
            <p className="text-slate-600">View your question and any responses</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="mb-2">{selectedQuestion.title}</CardTitle>
                <CardDescription className="text-base">{selectedQuestion.content}</CardDescription>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Badge className={`flex items-center gap-1 ${getStatusColor(selectedQuestion.status)}`}>
                  {getStatusIcon(selectedQuestion.status)}
                  {selectedQuestion.status.replace("_", " ")}
                </Badge>
                <Badge className={`flex items-center gap-1 ${getPriorityColor(selectedQuestion.priority)}`}>
                  {getPriorityIcon(selectedQuestion.priority)}
                  {selectedQuestion.priority}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Asked on {selectedQuestion.askedAt.toLocaleDateString()}
              </span>
              {selectedQuestion.answeredAt && (
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Answered on {selectedQuestion.answeredAt.toLocaleDateString()}
                </span>
              )}
            </div>

            {selectedQuestion.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedQuestion.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Status-specific content */}
            {selectedQuestion.status === "pending" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Awaiting Response</span>
                </div>
                <p className="text-blue-800 text-sm">
                  Your question has been submitted and is waiting for a response from the seller.
                </p>
              </div>
            )}

            {selectedQuestion.status === "needs_documents" && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileX className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-orange-900">Additional Documents Needed</span>
                </div>
                <p className="text-orange-800 text-sm">
                  The seller has indicated that additional documents are needed to properly answer your question. They
                  will upload the required documents and provide a response.
                </p>
              </div>
            )}

            {selectedQuestion.answer && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">Response from {selectedQuestion.answeredBy}</span>
                  <span className="text-sm text-green-700">on {selectedQuestion.answeredAt?.toLocaleDateString()}</span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-green-800 whitespace-pre-wrap">{selectedQuestion.answer}</p>
                </div>
                {selectedQuestion.relatedDocuments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-sm font-medium text-green-900 mb-2">Referenced Documents:</p>
                    <div className="space-y-1">
                      {selectedQuestion.relatedDocuments.map((docId) => (
                        <div key={docId} className="text-sm text-green-700">
                          • Document referenced in response
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Q&A Center</h2>
          <p className="text-slate-600">Manage your questions and track responses</p>
        </div>
        <Button onClick={() => setShowQuestionForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ask Question
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <MessageSquare className="w-5 h-5" />
              Total Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{userQuestions.length}</div>
            <CardDescription className="text-blue-700">Questions submitted</CardDescription>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Clock className="w-5 h-5" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{pendingQuestions.length}</div>
            <CardDescription className="text-yellow-700">Awaiting response</CardDescription>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="w-5 h-5" />
              Answered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{answeredQuestions.length}</div>
            <CardDescription className="text-green-700">Questions resolved</CardDescription>
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
            <CardDescription className="text-orange-700">Awaiting documents</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Question Management */}
      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="answered">Answered</TabsTrigger>
            <TabsTrigger value="needs-docs">Needs Docs</TabsTrigger>
          </TabsList>

          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as QuestionStatus | "all")}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
                <SelectItem value="needs_documents">Needs Docs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Questions</CardTitle>
              <CardDescription>Complete overview of your submitted questions</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{userQuestions.length === 0 ? "No questions submitted yet" : "No questions match your search"}</p>
                  {userQuestions.length === 0 && (
                    <Button className="mt-4" onClick={() => setShowQuestionForm(true)}>
                      Ask Your First Question
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuestions
                    .sort((a, b) => new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime())
                    .map((question) => (
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

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {question.askedAt.toLocaleDateString()}
                            </span>
                            {question.answeredAt && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Answered {question.answeredAt.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
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
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Questions</CardTitle>
              <CardDescription>Questions awaiting responses from sellers</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingQuestions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending questions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="border border-blue-200 rounded-lg p-4 bg-blue-50/30 hover:bg-blue-50 cursor-pointer"
                      onClick={() => setSelectedQuestionId(question.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{question.title}</h4>
                          <p className="text-slate-600 text-sm line-clamp-2">{question.content}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Asked {question.askedAt.toLocaleDateString()}</span>
                        <Button size="sm" variant="outline">
                          View Details
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
              <CardDescription>Questions that have received responses</CardDescription>
            </CardHeader>
            <CardContent>
              {answeredQuestions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No answered questions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {answeredQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="border border-green-200 rounded-lg p-4 bg-green-50/30 hover:bg-green-50 cursor-pointer"
                      onClick={() => setSelectedQuestionId(question.id)}
                    >
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
                          <p className="text-green-800 text-sm line-clamp-2">{question.answer}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          Answered by {question.answeredBy} on {question.answeredAt?.toLocaleDateString()}
                        </span>
                        <Button size="sm" variant="outline">
                          View Full Response
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="needs-docs">
          <Card>
            <CardHeader>
              <CardTitle>Questions Needing Documents</CardTitle>
              <CardDescription>Questions waiting for additional documentation</CardDescription>
            </CardHeader>
            <CardContent>
              {needsDocumentsQuestions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileX className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No questions need additional documents</p>
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
                      <div className="p-3 bg-orange-100 border border-orange-200 rounded mb-3">
                        <p className="text-orange-800 text-sm">
                          The seller is preparing additional documents to answer your question.
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Asked {question.askedAt.toLocaleDateString()}</span>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
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
