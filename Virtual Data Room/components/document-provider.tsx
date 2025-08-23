"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

export interface Document {
  id: string
  name: string
  size: number
  type: string
  uploadedBy: string
  uploadedAt: Date
  content: string // Base64 encoded content
  tags: string[]
}

interface DocumentContextType {
  documents: Document[]
  uploadDocument: (file: File, tags: string[]) => Promise<void>
  deleteDocument: (id: string) => void
  getDocumentsByTags: (tags: string[]) => Document[]
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined)

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    // Load documents from localStorage on mount
    const savedDocs = localStorage.getItem("vdr-documents")
    if (savedDocs) {
      const parsedDocs = JSON.parse(savedDocs)
      // Convert date strings back to Date objects
      const docsWithDates = parsedDocs.map((doc: any) => ({
        ...doc,
        uploadedAt: new Date(doc.uploadedAt),
      }))
      setDocuments(docsWithDates)
    }
  }, [])

  const uploadDocument = async (file: File, tags: string[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const newDoc: Document = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedBy: JSON.parse(localStorage.getItem("vdr-user") || "{}").name || "Unknown",
          uploadedAt: new Date(),
          content: reader.result as string,
          tags: tags.map((tag) => tag.toLowerCase().trim()),
        }

        const updatedDocs = [...documents, newDoc]
        setDocuments(updatedDocs)
        localStorage.setItem("vdr-documents", JSON.stringify(updatedDocs))
        resolve()
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
  }

  const deleteDocument = (id: string) => {
    const updatedDocs = documents.filter((doc) => doc.id !== id)
    setDocuments(updatedDocs)
    localStorage.setItem("vdr-documents", JSON.stringify(updatedDocs))
  }

  const getDocumentsByTags = (tags: string[]): Document[] => {
    if (tags.length === 0) return documents
    return documents.filter((doc) => tags.some((tag) => doc.tags.includes(tag.toLowerCase().trim())))
  }

  return (
    <DocumentContext.Provider value={{ documents, uploadDocument, deleteDocument, getDocumentsByTags }}>
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocuments() {
  const context = useContext(DocumentContext)
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentProvider")
  }
  return context
}
