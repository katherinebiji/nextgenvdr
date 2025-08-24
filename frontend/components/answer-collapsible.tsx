"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, FileText, Eye, Loader2 } from "lucide-react"
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
    <Card className="border-l-4 border-l-secondary">
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Answer Preview/Full */}
          <div className="space-y-2">
            <div className="text-sm leading-relaxed">
              {isExpanded ? question.answer : truncatedAnswer}
            </div>
            
            {question.answer && question.answer.length > 150 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 p-0 text-xs text-primary hover:text-primary/80"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show more
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Answer Metadata */}
          {question.answeredBy && question.answeredDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Answered by {question.answeredBy}</span>
              <span>•</span>
              <span>{new Date(question.answeredDate).toLocaleDateString()}</span>
            </div>
          )}

          {/* Source Attribution */}
          {question.answerSources && question.answerSources.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  {question.answerSources.length} source{question.answerSources.length !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Document analysis used
                </Badge>
              </div>
              
              <div className="space-y-1">
                {question.answerSources.slice(0, 3).map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-background border rounded text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="truncate font-medium">{source.document_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(source.similarity_score * 100)}%
                      </Badge>
                    </div>
                    {onViewDocument && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => onViewDocument(source.document_id, [{
                          chunk_id: `${source.document_id}_${source.chunk_index}`,
                          start_position: source.start_position,
                          end_position: source.end_position,
                          content: source.content
                        }])}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {question.answerSources.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    +{question.answerSources.length - 3} more sources
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}