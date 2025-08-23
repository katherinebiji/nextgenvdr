"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDocumentQuestionRouter } from "./document-question-router"
import type { Question } from "./question-provider"
import { FileText, Download, Lightbulb, Target } from "lucide-react"

interface QuestionDocumentSuggestionsProps {
  question: Question
}

export function QuestionDocumentSuggestions({ question }: QuestionDocumentSuggestionsProps) {
  const { findRelevantDocuments } = useDocumentQuestionRouter()

  const relevantDocuments = findRelevantDocuments(question)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const downloadDocument = (doc: any) => {
    const link = document.createElement("a")
    link.href = doc.content
    link.download = doc.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getScoreColor = (score: number) => {
    if (score >= 60) return "bg-green-100 text-green-800 border-green-200"
    if (score >= 30) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-blue-100 text-blue-800 border-blue-200"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 60) return "High Match"
    if (score >= 30) return "Medium Match"
    return "Low Match"
  }

  if (relevantDocuments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Suggested Documents
          </CardTitle>
          <CardDescription>Documents that might help answer this question</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-slate-500">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No relevant documents found for this question</p>
            <p className="text-xs mt-1">Consider uploading documents with matching tags or keywords</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Suggested Documents ({relevantDocuments.length})
        </CardTitle>
        <CardDescription>Documents that might help answer this question</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relevantDocuments.map(({ document, score, matchReasons }) => (
            <div
              key={document.id}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <div className="flex items-center gap-4 flex-1">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 truncate">{document.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                    <span>{formatFileSize(document.size)}</span>
                    <span>•</span>
                    <span>{document.uploadedAt.toLocaleDateString()}</span>
                  </div>
                  {matchReasons.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Target className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">{matchReasons.join(" • ")}</span>
                    </div>
                  )}
                  {document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {document.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {document.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{document.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <Badge className={`${getScoreColor(score)} text-xs`}>{getScoreLabel(score)}</Badge>
                <Button variant="outline" size="sm" onClick={() => downloadDocument(document)}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
