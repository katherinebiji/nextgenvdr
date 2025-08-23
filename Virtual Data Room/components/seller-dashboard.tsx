"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, MessageSquare, CheckCircle, Settings } from "lucide-react"
import { DocumentUpload } from "./document-upload"
import { DocumentList } from "./document-list"
import { SellerResponseDashboard } from "./seller-response-dashboard"
import { useDocuments } from "./document-provider"
import { useQuestions } from "./question-provider"
import { useState } from "react"

export function SellerDashboard() {
  const { documents } = useDocuments()
  const { questions, getQuestionsByStatus } = useQuestions()
  const [activeView, setActiveView] = useState<"overview" | "responses" | "documents">("overview")

  const answeredQuestions = getQuestionsByStatus("answered")
  const pendingQuestions = getQuestionsByStatus("pending")

  if (activeView === "responses") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setActiveView("overview")}>
            ← Back to Overview
          </Button>
        </div>
        <SellerResponseDashboard />
      </div>
    )
  }

  if (activeView === "documents") {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setActiveView("overview")}>
            ← Back to Overview
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Document Management</h2>
            <p className="text-slate-600">Upload and manage your data room documents</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocumentUpload />
          <DocumentList />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Seller Dashboard</h2>
        <p className="text-slate-600">Upload documents and respond to buyer questions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Upload className="w-5 h-5" />
              Documents Uploaded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{documents.length}</div>
            <CardDescription className="text-purple-700">Total documents in data room</CardDescription>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <MessageSquare className="w-5 h-5" />
              Questions Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{questions.length}</div>
            <CardDescription className="text-blue-700">Questions from buyers</CardDescription>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="w-5 h-5" />
              Questions Answered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{answeredQuestions.length}</div>
            <CardDescription className="text-green-700">Responses provided</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveView("responses")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Manage Responses
            </CardTitle>
            <CardDescription>
              {pendingQuestions.length > 0
                ? `${pendingQuestions.length} questions awaiting response`
                : "All questions answered"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full bg-transparent">
              Open Response Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveView("documents")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Manage Documents
            </CardTitle>
            <CardDescription>Upload new documents or organize existing ones</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full bg-transparent">
              Open Document Manager
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Data Room Settings
            </CardTitle>
            <CardDescription>Configure access permissions and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full bg-transparent" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest uploads and question responses</CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length === 0 && documents.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No activity yet. Start by uploading your first document!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingQuestions.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Pending Questions</h4>
                      <p className="text-sm text-blue-700">
                        {pendingQuestions.length} question{pendingQuestions.length !== 1 ? "s" : ""} need your attention
                      </p>
                    </div>
                    <Button size="sm" onClick={() => setActiveView("responses")}>
                      Review
                    </Button>
                  </div>
                </div>
              )}

              {documents.length > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-green-900">Document Library</h4>
                      <p className="text-sm text-green-700">
                        {documents.length} document{documents.length !== 1 ? "s" : ""} available for buyers
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setActiveView("documents")}>
                      Manage
                    </Button>
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
