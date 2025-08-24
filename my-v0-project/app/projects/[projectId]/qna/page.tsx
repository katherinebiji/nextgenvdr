"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { QnAList } from "@/components/qna-list"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { useAppStore, type Question } from "@/lib/store"
import { mockQuestions, mockCategorySuggestions } from "@/lib/mock-data"

export default function QnAPage() {
  const params = useParams()
  const { selectedQuestion, setSelectedQuestion } = useAppStore()
  const [selectedQuestionData, setSelectedQuestionData] = useState<Question | null>(null)

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestionData(question)
    setSelectedQuestion(question.id)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col gap-2">
            <BreadcrumbNav />
            <div>
              <h1 className="text-xl font-semibold">Q&A Hub</h1>
              <p className="text-sm text-muted-foreground">Buyer questions and seller responses</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6">
        <QnAList
          questions={mockQuestions}
          categorySuggestions={mockCategorySuggestions}
          onQuestionClick={handleQuestionClick}
          selectedQuestionId={selectedQuestion}
        />
      </div>
    </div>
  )
}
