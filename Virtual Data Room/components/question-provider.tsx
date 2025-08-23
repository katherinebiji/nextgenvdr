"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

export type QuestionStatus = "pending" | "answered" | "needs_documents"

export interface Question {
  id: string
  title: string
  content: string
  askedBy: string
  askedAt: Date
  status: QuestionStatus
  priority: "low" | "medium" | "high"
  tags: string[]
  answer?: string
  answeredBy?: string
  answeredAt?: Date
  relatedDocuments: string[] // Document IDs
}

interface QuestionContextType {
  questions: Question[]
  submitQuestion: (title: string, content: string, priority: "low" | "medium" | "high", tags: string[]) => void
  answerQuestion: (id: string, answer: string, relatedDocuments: string[]) => void
  markNeedsDocuments: (id: string) => void
  getQuestionsByStatus: (status: QuestionStatus) => Question[]
  getQuestionsByUser: (userId: string) => Question[]
}

const QuestionContext = createContext<QuestionContextType | undefined>(undefined)

export function QuestionProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    // Load questions from localStorage on mount
    const savedQuestions = localStorage.getItem("vdr-questions")
    if (savedQuestions) {
      const parsedQuestions = JSON.parse(savedQuestions)
      // Convert date strings back to Date objects
      const questionsWithDates = parsedQuestions.map((q: any) => ({
        ...q,
        askedAt: new Date(q.askedAt),
        answeredAt: q.answeredAt ? new Date(q.answeredAt) : undefined,
      }))
      setQuestions(questionsWithDates)
    }
  }, [])

  const submitQuestion = (title: string, content: string, priority: "low" | "medium" | "high", tags: string[]) => {
    const user = JSON.parse(localStorage.getItem("vdr-user") || "{}")
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      content,
      askedBy: user.name || "Unknown",
      askedAt: new Date(),
      status: "pending",
      priority,
      tags: tags.map((tag) => tag.toLowerCase().trim()),
      relatedDocuments: [],
    }

    const updatedQuestions = [...questions, newQuestion]
    setQuestions(updatedQuestions)
    localStorage.setItem("vdr-questions", JSON.stringify(updatedQuestions))
  }

  const answerQuestion = (id: string, answer: string, relatedDocuments: string[]) => {
    const user = JSON.parse(localStorage.getItem("vdr-user") || "{}")
    const updatedQuestions = questions.map((q) =>
      q.id === id
        ? {
            ...q,
            status: "answered" as QuestionStatus,
            answer,
            answeredBy: user.name || "Unknown",
            answeredAt: new Date(),
            relatedDocuments,
          }
        : q,
    )
    setQuestions(updatedQuestions)
    localStorage.setItem("vdr-questions", JSON.stringify(updatedQuestions))
  }

  const markNeedsDocuments = (id: string) => {
    const updatedQuestions = questions.map((q) =>
      q.id === id ? { ...q, status: "needs_documents" as QuestionStatus } : q,
    )
    setQuestions(updatedQuestions)
    localStorage.setItem("vdr-questions", JSON.stringify(updatedQuestions))
  }

  const getQuestionsByStatus = (status: QuestionStatus): Question[] => {
    return questions.filter((q) => q.status === status)
  }

  const getQuestionsByUser = (userId: string): Question[] => {
    return questions.filter((q) => q.askedBy === userId)
  }

  return (
    <QuestionContext.Provider
      value={{
        questions,
        submitQuestion,
        answerQuestion,
        markNeedsDocuments,
        getQuestionsByStatus,
        getQuestionsByUser,
      }}
    >
      {children}
    </QuestionContext.Provider>
  )
}

export function useQuestions() {
  const context = useContext(QuestionContext)
  if (context === undefined) {
    throw new Error("useQuestions must be used within a QuestionProvider")
  }
  return context
}
