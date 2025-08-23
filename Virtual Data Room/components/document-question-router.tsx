"use client"

import type React from "react"

import { createContext, useContext } from "react"
import { useDocuments, type Document } from "./document-provider"
import { useQuestions, type Question } from "./question-provider"

interface DocumentMatch {
  document: Document
  score: number
  matchReasons: string[]
}

interface RoutingContextType {
  findRelevantDocuments: (question: Question) => DocumentMatch[]
  findQuestionsForDocument: (document: Document) => Question[]
  suggestDocumentsForQuestion: (questionId: string) => DocumentMatch[]
  getDocumentRelevanceScore: (document: Document, question: Question) => number
}

const RoutingContext = createContext<RoutingContextType | undefined>(undefined)

export function DocumentQuestionRouter({ children }: { children: React.ReactNode }) {
  const { documents } = useDocuments()
  const { questions } = useQuestions()

  const getDocumentRelevanceScore = (document: Document, question: Question): number => {
    let score = 0
    const matchReasons: string[] = []

    // Tag matching (highest weight)
    const commonTags = document.tags.filter((tag) =>
      question.tags.some((qTag) => qTag.includes(tag) || tag.includes(qTag)),
    )
    if (commonTags.length > 0) {
      score += commonTags.length * 40
      matchReasons.push(`Matching tags: ${commonTags.join(", ")}`)
    }

    // Keyword matching in document name vs question title/content
    const questionText = `${question.title} ${question.content}`.toLowerCase()
    const documentName = document.name.toLowerCase()

    // Extract keywords from question (simple approach)
    const questionWords = questionText.split(/\s+/).filter((word) => word.length > 3)
    const documentWords = documentName.split(/[\s._-]+/).filter((word) => word.length > 3)

    const matchingWords = questionWords.filter((qWord) =>
      documentWords.some((dWord) => dWord.includes(qWord) || qWord.includes(dWord)),
    )

    if (matchingWords.length > 0) {
      score += matchingWords.length * 20
      matchReasons.push(`Keyword matches: ${matchingWords.slice(0, 3).join(", ")}`)
    }

    // File type relevance
    const questionLower = questionText.toLowerCase()
    if (
      questionLower.includes("financial") &&
      (document.name.includes("financial") || document.name.includes("budget"))
    ) {
      score += 15
      matchReasons.push("Financial document type")
    }
    if (questionLower.includes("legal") && (document.name.includes("legal") || document.name.includes("contract"))) {
      score += 15
      matchReasons.push("Legal document type")
    }
    if (questionLower.includes("technical") && (document.name.includes("tech") || document.name.includes("spec"))) {
      score += 15
      matchReasons.push("Technical document type")
    }

    // Recent documents get slight boost
    const daysSinceUpload = (Date.now() - document.uploadedAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceUpload < 7) {
      score += 5
      matchReasons.push("Recently uploaded")
    }

    return score
  }

  const findRelevantDocuments = (question: Question): DocumentMatch[] => {
    const matches: DocumentMatch[] = documents.map((document) => {
      const score = getDocumentRelevanceScore(document, question)
      const matchReasons: string[] = []

      // Recalculate reasons for display
      const commonTags = document.tags.filter((tag) =>
        question.tags.some((qTag) => qTag.includes(tag) || tag.includes(qTag)),
      )
      if (commonTags.length > 0) {
        matchReasons.push(`Tags: ${commonTags.join(", ")}`)
      }

      const questionText = `${question.title} ${question.content}`.toLowerCase()
      const questionWords = questionText.split(/\s+/).filter((word) => word.length > 3)
      const documentWords = document.name
        .toLowerCase()
        .split(/[\s._-]+/)
        .filter((word) => word.length > 3)

      const matchingWords = questionWords.filter((qWord) =>
        documentWords.some((dWord) => dWord.includes(qWord) || qWord.includes(dWord)),
      )

      if (matchingWords.length > 0) {
        matchReasons.push(`Keywords: ${matchingWords.slice(0, 2).join(", ")}`)
      }

      return {
        document,
        score,
        matchReasons,
      }
    })

    return matches
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Return top 10 matches
  }

  const findQuestionsForDocument = (document: Document): Question[] => {
    return questions
      .map((question) => ({
        question,
        score: getDocumentRelevanceScore(document, question),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.question)
      .slice(0, 5) // Return top 5 related questions
  }

  const suggestDocumentsForQuestion = (questionId: string): DocumentMatch[] => {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return []

    return findRelevantDocuments(question)
  }

  return (
    <RoutingContext.Provider
      value={{
        findRelevantDocuments,
        findQuestionsForDocument,
        suggestDocumentsForQuestion,
        getDocumentRelevanceScore,
      }}
    >
      {children}
    </RoutingContext.Provider>
  )
}

export function useDocumentQuestionRouter() {
  const context = useContext(RoutingContext)
  if (context === undefined) {
    throw new Error("useDocumentQuestionRouter must be used within a DocumentQuestionRouter")
  }
  return context
}
