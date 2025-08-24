"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Brain, CheckCircle, XCircle, AlertTriangle, Folder, FileText } from "lucide-react"
import type { RelevanceSuggestion, Question } from "@/lib/store"

interface RelevancePanelProps {
  suggestion: RelevanceSuggestion
  questions: Question[]
  onAccept: (suggestion: RelevanceSuggestion) => void
  onOverride: (suggestion: RelevanceSuggestion) => void
  onClose: () => void
}

export function RelevancePanel({ suggestion, questions, onAccept, onOverride, onClose }: RelevancePanelProps) {
  const [customPath, setCustomPath] = useState(suggestion.targetPath)
  const [customName, setCustomName] = useState(suggestion.rename)

  const relevantQuestions = questions.filter((q) => suggestion.relevantQuestionIds.includes(q.id))

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-secondary"
    if (confidence >= 0.6) return "text-primary"
    return "text-destructive"
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4" />
    if (confidence >= 0.6) return <AlertTriangle className="h-4 w-4" />
    return <XCircle className="h-4 w-4" />
  }

  const handleAccept = () => {
    onAccept({
      ...suggestion,
      targetPath: customPath,
      rename: customName,
    })
  }

  const handleOverride = () => {
    onOverride({
      ...suggestion,
      targetPath: customPath,
      rename: customName,
    })
  }

  return (
    <div className="w-80 border-l border-border bg-card h-full overflow-y-auto">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Relevance Analysis</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* File Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {suggestion.filename}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Confidence</span>
              <div className={`flex items-center gap-1 ${getConfidenceColor(suggestion.confidence)}`}>
                {getConfidenceIcon(suggestion.confidence)}
                <span className="text-sm font-medium">{Math.round(suggestion.confidence * 100)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Location */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Suggested Location</Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <Input
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                className="border-0 bg-transparent p-0 h-auto text-sm"
              />
            </div>
          </div>
        </div>

        {/* Suggested Filename */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Suggested Filename</Label>
          <Input value={customName} onChange={(e) => setCustomName(e.target.value)} className="text-sm" />
        </div>

        {/* Matching Questions */}
        {relevantQuestions.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Matching Questions ({relevantQuestions.length})</Label>
            <div className="space-y-2">
              {relevantQuestions.map((question) => (
                <Card key={question.id} className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {question.category}
                      </Badge>
                      <Badge variant={question.priority === "High" ? "destructive" : "secondary"} className="text-xs">
                        {question.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{question.requestedItem}</p>
                    <p className="text-xs text-muted-foreground">
                      {question.buyerId} • Due {question.dueDate}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Irrelevant Warning */}
        {suggestion.irrelevant && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Potentially Irrelevant Upload</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">This file may not match any current buyer questions.</p>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          <Button onClick={handleAccept} className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Accept Suggestions
          </Button>
          <Button variant="outline" onClick={handleOverride} className="w-full bg-transparent">
            Override & Place File
          </Button>
        </div>
      </div>
    </div>
  )
}
