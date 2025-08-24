"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, FileText, Eye, Loader2, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import type { QATrackingItem } from "@/lib/store"

interface AnswerCollapsibleProps {
  question: QATrackingItem
  onViewDocument?: (documentId: string, highlights?: any[]) => void
  onGenerateAnswer?: (questionId: string) => Promise<void>
  isGenerating?: boolean
}

export function AnswerCollapsible({ 
  question, 
  onViewDocument, 
  onGenerateAnswer,
  isGenerating = false 
}: AnswerCollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (question.status !== "Complete") {
    return (
      <div className="text-sm text-muted-foreground">
        Answer will be available when question is marked as Complete
      </div>
    )
  }

  if (!question.answer && !isGenerating) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">No answer generated</span>
        {onGenerateAnswer && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onGenerateAnswer(question.id)}
            className="h-6 text-xs"
          >
            Generate Answer
          </Button>
        )}
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Generating AI answer...
      </div>
    )
  }

  const truncatedAnswer = question.answer?.length > 150 
    ? question.answer.substring(0, 150) + "..." 
    : question.answer

  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-4">
      {/* Answer Content */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI Generated Answer</span>
          {question.answeredBy && question.answeredDate && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                by {question.answeredBy} on {new Date(question.answeredDate).toLocaleDateString()}
              </span>
            </>
          )}
        </div>
        
        <div className="prose prose-sm max-w-none">
          <div className="text-sm leading-relaxed text-foreground bg-muted/30 p-3 rounded-md">
            {isExpanded ? question.answer : truncatedAnswer}
          </div>
          
          {question.answer && question.answer.length > 150 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="h-6 p-0 text-xs text-primary hover:text-primary/80 mt-2"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show full answer
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Source Attribution */}
      {question.answerSources && question.answerSources.length > 0 && (
        <div className="space-y-3 border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Source Documents</span>
            <Badge variant="outline" className="text-xs">
              {question.answerSources.length} reference{question.answerSources.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="grid gap-2">
            {question.answerSources.slice(0, 3).map((source, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 border rounded-md">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium block truncate">{source.document_name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(source.similarity_score * 100)}% match
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Chunk {source.chunk_index + 1}
                      </span>
                    </div>
                  </div>
                </div>
                {onViewDocument && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewDocument(source.document_id, [{
                        chunk_id: `${source.document_id}_${source.chunk_index}`,
                        start_position: source.start_position,
                        end_position: source.end_position,
                        content: source.content
                      }])
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                )}
              </div>
            ))}
            
            {question.answerSources.length > 3 && (
              <div className="text-xs text-muted-foreground text-center py-2 border-t border-dashed">
                +{question.answerSources.length - 3} additional source documents
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}