"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useQuestions } from "./question-provider"
import { useDocuments } from "./document-provider"
import { useDocumentQuestionRouter } from "./document-question-router"
import type { Question } from "./question-provider"
import { MessageSquare, FileText, Send } from "lucide-react"

interface QuestionResponseFormProps {
  question: Question
  onComplete?: () => void
}

export function QuestionResponseForm({ question, onComplete }: QuestionResponseFormProps) {
  const [answer, setAnswer] = useState("")
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { answerQuestion, markNeedsDocuments } = useQuestions()
  const { documents } = useDocuments()
  const { findRelevantDocuments } = useDocumentQuestionRouter()

  const relevantDocuments = findRelevantDocuments(question)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim()) return

    setIsSubmitting(true)
    try {
      answerQuestion(question.id, answer.trim(), selectedDocuments)
      setAnswer("")
      setSelectedDocuments([])
      onComplete?.()
    } catch (error) {
      console.error("Failed to submit answer:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkNeedsDocuments = () => {
    markNeedsDocuments(question.id)
    onComplete?.()
  }

  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId) ? prev.filter((id) => id !== documentId) : [...prev, documentId],
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Provide Answer
          </CardTitle>
          <CardDescription>
            Write a comprehensive response to help the buyer understand the information they need
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="answer" className="text-sm font-medium">
                Your Response
              </Label>
              <Textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Provide a detailed answer to the buyer's question..."
                required
                className="min-h-[150px] resize-none"
              />
              <p className="text-xs text-slate-500">Be specific and reference relevant documents when possible</p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={!answer.trim() || isSubmitting} className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleMarkNeedsDocuments}
                className="flex-1 bg-transparent"
              >
                Mark as Needs Documents
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {relevantDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Reference Documents
            </CardTitle>
            <CardDescription>Select documents that support your answer (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relevantDocuments.slice(0, 5).map(({ document, score }) => (
                <div key={document.id} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                  <Checkbox
                    id={`doc-${document.id}`}
                    checked={selectedDocuments.includes(document.id)}
                    onCheckedChange={() => toggleDocumentSelection(document.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={`doc-${document.id}`}
                      className="text-sm font-medium text-slate-900 cursor-pointer block truncate"
                    >
                      {document.name}
                    </label>
                    <p className="text-xs text-slate-500">
                      Uploaded {document.uploadedAt.toLocaleDateString()} • {Math.round(document.size / 1024)} KB
                    </p>
                  </div>
                  <div className="text-xs text-slate-500">
                    {score >= 60 ? "High" : score >= 30 ? "Medium" : "Low"} match
                  </div>
                </div>
              ))}
            </div>
            {selectedDocuments.length > 0 && (
              <p className="text-sm text-slate-600 mt-3">
                {selectedDocuments.length} document{selectedDocuments.length !== 1 ? "s" : ""} selected to reference in
                your answer
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
