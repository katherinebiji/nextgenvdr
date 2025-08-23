"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, FileText, Clock, Settings } from "lucide-react"
import { DocumentList } from "./document-list"
import { BuyerQAInterface } from "./buyer-qa-interface"
import { useDocuments } from "./document-provider"
import { useQuestions } from "./question-provider"
import { useAuth } from "./auth-provider"
import { useState } from "react"

export function BuyerDashboard() {
  const { documents } = useDocuments()
  const { questions } = useQuestions()
  const { user } = useAuth()
  const [activeView, setActiveView] = useState<"overview" | "qa" | "documents">("overview")

  const userQuestions = questions.filter((q) => q.askedBy === user?.name)
  const pendingQuestions = userQuestions.filter((q) => q.status === "pending")
  const answeredQuestions = userQuestions.filter((q) => q.status === "answered")

  if (activeView === "qa") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setActiveView("overview")}>
            ← Back to Overview
          </Button>
        </div>
        <BuyerQAInterface />
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
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Document Library</h2>
            <p className="text-slate-600">Browse and download available documents</p>
          </div>
        </div>
        <DocumentList />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Buyer Dashboard</h2>
        <p className="text-slate-600">Ask questions and review documents from sellers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <MessageSquare className="w-5 h-5" />
              Questions Asked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{userQuestions.length}</div>
            <CardDescription className="text-blue-700">Total questions submitted</CardDescription>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <FileText className="w-5 h-5" />
              Documents Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{documents.length}</div>
            <CardDescription className="text-green-700">Documents ready for review</CardDescription>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <Clock className="w-5 h-5" />
              Pending Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{pendingQuestions.length}</div>
            <CardDescription className="text-orange-700">Questions awaiting answers</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveView("qa")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Q&A Center
            </CardTitle>
            <CardDescription>
              {pendingQuestions.length > 0
                ? `${pendingQuestions.length} questions pending response`
                : answeredQuestions.length > 0
                  ? `${answeredQuestions.length} questions answered`
                  : "Ask your first question"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full bg-transparent">
              Manage Questions
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveView("documents")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Document Library
            </CardTitle>
            <CardDescription>
              {documents.length > 0 ? `${documents.length} documents available` : "No documents uploaded yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full bg-transparent">
              Browse Documents
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Account Settings
            </CardTitle>
            <CardDescription>Manage your profile and notification preferences</CardDescription>
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
          <CardDescription>Your latest questions and document reviews</CardDescription>
        </CardHeader>
        <CardContent>
          {userQuestions.length === 0 && documents.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No activity yet. Start by asking your first question!</p>
              <Button className="mt-4" onClick={() => setActiveView("qa")}>
                Ask a Question
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {answeredQuestions.length > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-green-900">New Responses</h4>
                      <p className="text-sm text-green-700">
                        {answeredQuestions.length} question{answeredQuestions.length !== 1 ? "s" : ""} answered
                      </p>
                    </div>
                    <Button size="sm" onClick={() => setActiveView("qa")}>
                      View Responses
                    </Button>
                  </div>
                </div>
              )}

              {pendingQuestions.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Pending Questions</h4>
                      <p className="text-sm text-blue-700">
                        {pendingQuestions.length} question{pendingQuestions.length !== 1 ? "s" : ""} awaiting response
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setActiveView("qa")}>
                      Track Progress
                    </Button>
                  </div>
                </div>
              )}

              {documents.length > 0 && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-purple-900">Document Library</h4>
                      <p className="text-sm text-purple-700">
                        {documents.length} document{documents.length !== 1 ? "s" : ""} available for review
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setActiveView("documents")}>
                      Browse
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
