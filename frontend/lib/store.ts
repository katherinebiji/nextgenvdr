import { create } from "zustand"
import { apiService } from "./api"

// Mock data types
export interface Project {
  id: string
  name: string
  description: string
  buyers: string[]
  qaCompletionPct: number
  lastActivity: string
  status: string
  dueDate: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  access: {
    view: boolean
    upload: boolean
    qa: boolean
    respond: boolean
  }
  folderPermissions: string[] // folder IDs user has access to
  buyerGroup?: string // 'Buyer A' | 'Buyer B' for buyer users
}

export interface Folder {
  id: string
  name: string
  path: string
  parentId?: string
  children?: Folder[]
  visibleTo: string[] | "All"
}

export interface File {
  id: string
  name: string
  path: string
  folderId: string
  size: number
  modified: string
  version: string
  visibleTo: string[] | "All"
  type: string
  uploadedBy: string
}

export interface Question {
  id: string
  buyerId: string
  priority: "High" | "Medium" | "Low"
  status: "Open" | "In Progress" | "Answered"
  requestedItem: string
  dueDate: string
  reviewedByBank: "Yes" | "In Progress" | "Not Started"
  category?: string
  subcategory?: string
  description: string
  team?: string
  linkedFiles?: string[]
}

export interface QATrackingItem {
  id: string
  question: string
  buyerId: string
  status: "Complete" | "In Progress" | "Open"
  team: string
  category: string
  subcategory: string
  priority: "High" | "Medium" | "Low"
  dueDate: string
  reviewedByBank: "Yes" | "In Progress" | "Not Started"
  description: string
  linkedFiles: string[]
  submittedDate: string
  history: Array<{
    date: string
    action: string
    user: string
    note: string
  }>
  answer?: string
  answerSources?: Array<{
    document_id: string
    document_name: string
    chunk_index: number
    start_position: number
    end_position: number
    content: string
    similarity_score: number
  }>
  answeredDate?: string
  answeredBy?: string
}

export interface TrackerItem {
  id: string
  indexLink: string
  folderPath: string
  status: "Open" | "In Progress" | "Complete"
  team: "Seller" | "Legal" | "Finance" | "HR" | "Tax" | "Commercial" | "IT"
  requestedItem: string
  reviewedByBank: "Yes" | "In Progress" | "Not Started"
  dueDate: string
  priority: "High" | "Medium" | "Low"
  questionId?: string
  description: string
  history: Array<{
    date: string
    action: string
    user: string
    note?: string
  }>
}

export interface CategorySuggestion {
  questionId: string
  suggestion: {
    category: string
    subcategory: string
    confidence: number
    alternatives: string[]
  }
}

export interface RelevanceSuggestion {
  filename: string
  relevantQuestionIds: string[]
  targetPath: string
  confidence: number
  rename: string
  irrelevant: boolean
}

export interface Permission {
  userId: string
  folderId: string
  canView: boolean
  canUpload: boolean
  canModify: boolean
}

export interface Settings {
  multipleBuyersEnabled: boolean
  defaultBuyerVisibility: "All" | string[]
  confirmBeforeExposing: boolean
  autoCategorizationEnabled: boolean
}

interface AppState {
  currentUser: User | null
  currentProject: Project | null
  folders: Folder[]
  files: File[]
  questions: Question[]
  trackerItems: TrackerItem[]
  categorySuggestions: CategorySuggestion[]
  users: User[]
  permissions: Permission[]
  settings: Settings
  selectedQuestion: string | null
  selectedTracker: string | null
  selectedFolder: string | null
  selectedFile: string | null
  showRelevancePanel: boolean
  currentRelevance: RelevanceSuggestion | null
  buyerFilter: string
  qaTrackingItems: QATrackingItem[]
  setCurrentUser: (user: User) => void
  setCurrentProject: (project: Project) => void
  setSelectedQuestion: (questionId: string | null) => void
  setSelectedTracker: (trackerId: string | null) => void
  setSelectedFolder: (folderId: string | null) => void
  setSelectedFile: (fileId: string | null) => void
  setShowRelevancePanel: (show: boolean) => void
  setCurrentRelevance: (relevance: RelevanceSuggestion | null) => void
  setBuyerFilter: (buyer: string) => void
  addFile: (file: File) => void
  uploadFileToBackend: (file: globalThis.File, tags: string[]) => Promise<boolean>
  getProjectFiles: () => Promise<File[]>
  loadProjectFiles: () => Promise<void>
  deleteFile: (fileId: string) => Promise<boolean>
  downloadFile: (fileId: string) => Promise<void>
  getDocumentPreview: (documentId: string) => Promise<any>
  processDocumentForRAG: (documentId: string) => Promise<any>
  ragChat: (message: string, chatHistory?: Array<{role: string, content: string}>) => Promise<any>
  updateFileVisibility: (fileId: string, visibleTo: string[] | "All") => void
  updateQuestionCategory: (questionId: string, category: string, subcategory: string) => void
  updateTrackerStatus: (trackerId: string, status: TrackerItem["status"]) => void
  linkFileToQuestion: (questionId: string, fileId: string) => void
  addUser: (user: User) => void
  updateUser: (userId: string, updates: Partial<User>) => void
  removeUser: (userId: string) => void
  updateUserFolderPermissions: (userId: string, folderIds: string[]) => void
  updateSettings: (newSettings: Partial<Settings>) => void
  generateAnswerForQuestion: (questionId: string) => Promise<void>
  updateQuestionAnswer: (questionId: string, answer: string, sources: QATrackingItem["answerSources"], answeredBy: string) => void
  setQATrackingItems: (items: QATrackingItem[]) => void
  uploadQuestionsText: (text: string) => Promise<boolean>
  uploadQuestionsFiles: (files: File[]) => Promise<boolean>
  loadQuestionsFromBackend: () => Promise<void>
  deleteQuestion: (questionId: string) => Promise<boolean>
  purgeAllFiles: (userId: string, projectId: string) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  currentProject: null,
  folders: [],
  files: [],
  questions: [],
  trackerItems: [],
  categorySuggestions: [],
  users: [],
  permissions: [],
  settings: {
    multipleBuyersEnabled: true,
    defaultBuyerVisibility: "All",
    confirmBeforeExposing: true,
    autoCategorizationEnabled: true,
  },
  selectedQuestion: null,
  selectedTracker: null,
  selectedFolder: null,
  selectedFile: null,
  showRelevancePanel: false,
  currentRelevance: null,
  buyerFilter: "All",
  qaTrackingItems: [],
  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentProject: (project) => set({ currentProject: project }),
  setSelectedQuestion: (questionId) => set({ selectedQuestion: questionId }),
  setSelectedTracker: (trackerId) => set({ selectedTracker: trackerId }),
  setSelectedFolder: (folderId) => set({ selectedFolder: folderId }),
  setSelectedFile: (fileId) => set({ selectedFile: fileId }),
  setShowRelevancePanel: (show) => set({ showRelevancePanel: show }),
  setCurrentRelevance: (relevance) => set({ currentRelevance: relevance }),
  setBuyerFilter: (buyer) => set({ buyerFilter: buyer }),
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  uploadFileToBackend: async (file, tags) => {
    try {
      const response = await apiService.uploadDocument(file, tags)
      if (response.success && response.data) {
        const newFile: File = {
          id: response.data.id,
          name: response.data.name,
          path: `/${response.data.name}`,
          folderId: tags[0] || "general",
          size: response.data.size,
          modified: response.data.uploaded_at,
          version: "1.0",
          visibleTo: "All",
          type: response.data.type,
          uploadedBy: response.data.uploaded_by
        }
        set((state) => ({ files: [...state.files, newFile] }))
        return true
      }
      return false
    } catch (error) {
      console.error("Upload failed:", error)
      return false
    }
  },
  getProjectFiles: async () => {
    try {
      const response = await apiService.getDocuments()
      if (response.success && response.data) {
        return response.data.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          path: `/${doc.name}`,
          folderId: doc.tags[0] || "general",
          size: doc.size,
          modified: doc.uploaded_at,
          version: "1.0",
          visibleTo: "All",
          type: doc.type,
          uploadedBy: doc.uploaded_by
        }))
      }
      return []
    } catch (error) {
      console.error("Failed to fetch files:", error)
      return []
    }
  },
  loadProjectFiles: async () => {
    try {
      const files = await get().getProjectFiles()
      set({ files })
    } catch (error) {
      console.error("Failed to load files:", error)
    }
  },
  deleteFile: async (fileId) => {
    try {
      const response = await apiService.deleteDocument(fileId)
      if (response.success) {
        set((state) => ({ files: state.files.filter(f => f.id !== fileId) }))
        return true
      }
      return false
    } catch (error) {
      console.error("Delete failed:", error)
      return false
    }
  },
  downloadFile: async (fileId) => {
    try {
      const response = await apiService.getDocument(fileId)
      if (response.success && response.data) {
        const content = response.data.content
        if (content.startsWith("data:")) {
          const link = document.createElement("a")
          link.href = content
          link.download = response.data.name
          link.click()
        }
      }
    } catch (error) {
      console.error("Download failed:", error)
    }
  },
  getDocumentPreview: async (documentId) => {
    // Mock meeting minutes documents
    const mockMeetingMinutes = {
      "board-minutes-2023": {
        document_id: "board-minutes-2023",
        document_name: "Board Meeting Minutes - December 2023.pdf",
        document_type: "pdf",
        text_content: `TECHCORP CORPORATION
MINUTES OF BOARD OF DIRECTORS MEETING
December 15, 2023

CALL TO ORDER
The meeting was called to order at 2:00 PM EST by Chairman of the Board, Robert Chen.

DIRECTORS PRESENT
- Robert Chen, Chairman
- Sarah Johnson, CEO  
- Michael Rodriguez, CFO
- Jennifer Park, Independent Director
- David Liu, Independent Director

DIRECTORS ABSENT
None

AGENDA ITEMS

1. STRATEGIC PLAN APPROVAL
RESOLVED, that the Board hereby approves the strategic plan as presented by management for fiscal year 2024, including the proposed expansion into European markets and the establishment of three new subsidiary entities in Germany, France, and the United Kingdom.

The strategic plan includes:
- Target revenue growth of 35% in FY2024
- Expansion into EMEA markets with initial investment of $15M
- Establishment of TechCorp Europe GmbH, TechCorp France SAS, and TechCorp UK Ltd
- Hiring of 150 additional employees across all jurisdictions

Motion passed unanimously.

2. AUTHORIZATION OF MAJOR CONTRACTS
RESOLVED, that the officers of the Corporation are hereby authorized to enter into definitive agreements with Deutsche Bank AG for a €50M credit facility to support European expansion, subject to terms substantially similar to those outlined in the term sheet presented to the Board.

Motion passed 4-1 (Director Park abstaining due to potential conflict).

3. EXECUTIVE COMPENSATION REVIEW
The Compensation Committee presented its annual review of executive compensation. Following extensive market analysis and benchmarking against peer companies, the Board approved:

- CEO base salary increase to $850,000 (previously $750,000)
- Establishment of performance bonus pool equal to 2.5% of EBITDA
- Grant of equity awards totaling 250,000 stock options across C-level executives

Motion passed unanimously.

ADJOURNMENT
There being no further business, the meeting was adjourned at 4:30 PM EST.

Respectfully submitted,
Jennifer Park, Secretary`,
        chunks: [
          {
            chunk_id: "chunk-1",
            content: "RESOLVED, that the Board hereby approves the strategic plan as presented by management for fiscal year 2024, including the proposed expansion into European markets and the establishment of three new subsidiary entities...",
            chunk_index: 1,
            start_position: 245,
            end_position: 1250,
            chunk_length: 1005
          }
        ],
        processing_status: "completed"
      },
      "board-minutes-2023-q3": {
        document_id: "board-minutes-2023-q3",
        document_name: "Board Meeting Minutes - September 2023.pdf",
        document_type: "pdf",
        text_content: `TECHCORP CORPORATION
MINUTES OF BOARD OF DIRECTORS MEETING
September 22, 2023

CALL TO ORDER
The quarterly meeting was called to order at 10:00 AM EST by Chairman Robert Chen.

DIRECTORS PRESENT
- Robert Chen, Chairman
- Sarah Johnson, CEO
- Michael Rodriguez, CFO
- Jennifer Park, Independent Director  
- David Liu, Independent Director

AGENDA ITEMS

1. Q3 FINANCIAL REVIEW
CFO Rodriguez presented Q3 financial results:
- Revenue: $47.2M (22% growth YoY)
- EBITDA: $12.1M (25.6% margin)
- Cash position: $23.4M
- Accounts receivable: 42 days outstanding

The Board noted strong performance across all business units.

2. EXECUTIVE COMPENSATION DECISIONS
Motion to approve executive compensation packages for C-level officers was carried unanimously. Total compensation disclosed in Schedule A attached hereto includes:

- Base salary adjustments effective October 1, 2023
- Performance bonuses for Q3 achievement of 115% of targets
- Long-term incentive plan modifications to align with peer benchmarks

The compensation structure reflects market competitive positioning while maintaining alignment with shareholder interests.

3. STRATEGIC INITIATIVES UPDATE
CEO Johnson provided updates on key strategic initiatives:
- Product development milestone achievements
- Market expansion preparation for 2024
- Technology infrastructure investments
- Talent acquisition progress

AUDIT COMMITTEE REPORT
Audit Committee Chair Park reported on the committee's review of internal controls and risk management processes. No material weaknesses identified.

ADJOURNMENT
Meeting adjourned at 11:45 AM EST.

Respectfully submitted,
Corporate Secretary`,
        chunks: [
          {
            chunk_id: "chunk-2",
            content: "Motion to approve executive compensation packages for C-level officers was carried unanimously. Total compensation disclosed in Schedule A attached hereto...",
            chunk_index: 2,
            start_position: 420,
            end_position: 890,
            chunk_length: 470
          }
        ],
        processing_status: "completed"
      },
      "shareholder-minutes-2023": {
        document_id: "shareholder-minutes-2023",
        document_name: "Annual Shareholder Meeting Minutes - June 2023.pdf",
        document_type: "pdf",
        text_content: `TECHCORP CORPORATION
MINUTES OF ANNUAL MEETING OF SHAREHOLDERS
June 10, 2023

CALL TO ORDER
The Annual Meeting of Shareholders of TechCorp Corporation was called to order at 10:00 AM EST on Saturday, June 10, 2023, at the Corporation's headquarters located at 1234 Innovation Drive, San Francisco, CA 94105.

ATTENDANCE AND QUORUM
Chairman Robert Chen presided over the meeting. Corporate Secretary Jennifer Park recorded the minutes.

Quorum was established with 8,542,186 shares represented in person or by proxy out of 10,000,000 shares outstanding (85.42% representation).

SHAREHOLDERS PRESENT OR REPRESENTED BY PROXY
- Founders and Management: 4,500,000 shares (45%)
- Venture Capital Investors: 3,500,000 shares (35%) 
- Employee Stock Option Plan: 2,000,000 shares (20%)

AGENDA

1. APPROVAL OF 2022 ANNUAL REPORT
The Chairman presented the 2022 Annual Report, highlighting:
- Record revenue of $156M (28% growth)
- Achievement of profitability with net income of $18.2M
- Successful product launches in Q4 2022
- Strong balance sheet with $45M cash and minimal debt

Motion to approve the 2022 Annual Report was carried with 99.2% of votes in favor.

2. ELECTION OF DIRECTORS
The following directors were elected to serve until the 2024 Annual Meeting:
- Robert Chen (Chairman) - 8,442,186 votes (98.8%)
- Sarah Johnson (CEO) - 8,398,567 votes (98.3%)
- Jennifer Park (Independent) - 8,301,234 votes (97.2%)
- David Liu (Independent) - 8,289,445 votes (97.0%)
- Michael Rodriguez (CFO) - 8,456,789 votes (99.0%)

3. RATIFICATION OF AUDITORS
Motion to ratify the appointment of Deloitte & Touche LLP as independent auditors for fiscal year 2023 was approved with 8,234,567 votes in favor (96.4%).

4. ADVISORY VOTE ON EXECUTIVE COMPENSATION
The non-binding advisory vote on executive compensation received 7,890,123 votes in favor (92.4%), demonstrating strong shareholder support for the compensation philosophy and practices.

ADJOURNMENT
There being no further business, the meeting was adjourned at 11:30 AM EST.

Respectfully submitted,
Jennifer Park, Corporate Secretary

Date: June 10, 2023`,
        chunks: [
          {
            chunk_id: "chunk-0",
            content: "Annual meeting called to order at 10:00 AM EST. Quorum established with 85% of outstanding shares represented in person or by proxy...",
            chunk_index: 0,
            start_position: 156,
            end_position: 567,
            chunk_length: 411
          }
        ],
        processing_status: "completed"
      }
    }

    // Check if this is one of our mock meeting minutes
    if (mockMeetingMinutes[documentId as keyof typeof mockMeetingMinutes]) {
      return mockMeetingMinutes[documentId as keyof typeof mockMeetingMinutes]
    }

    try {
      const response = await apiService.getDocumentPreview(documentId)
      if (response.success) {
        return response.data
      }
      return null
    } catch (error) {
      console.error("Failed to get document preview:", error)
      return null
    }
  },
  processDocumentForRAG: async (documentId) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/process`, { method: 'POST' })
      return await response.json()
    } catch (error) {
      console.error("Failed to process document:", error)
      return null
    }
  },
  ragChat: async (message, chatHistory = []) => {
    try {
      const response = await apiService.ragChat(message, chatHistory)
      return response.data
    } catch (error) {
      console.error("RAG chat failed:", error)
      return {
        response: "Sorry, I encountered an error while processing your request.",
        used_documents: false,
        sources: [],
        success: false,
        message_type: "error"
      }
    }
  },
  updateFileVisibility: (fileId, visibleTo) => {
    set((state) => {
      const updatedFiles = state.files.map((f) => (f.id === fileId ? { ...f, visibleTo } : f))
      return { files: updatedFiles }
    })
  },
  updateQuestionCategory: (questionId, category, subcategory) =>
    set((state) => ({
      questions: state.questions.map((q) => (q.id === questionId ? { ...q, category, subcategory } : q)),
    })),
  updateTrackerStatus: (trackerId, status) =>
    set((state) => ({
      trackerItems: state.trackerItems.map((t) => (t.id === trackerId ? { ...t, status } : t)),
    })),
  linkFileToQuestion: (questionId, fileId) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, linkedFiles: [...(q.linkedFiles || []), fileId] } : q,
      ),
    })),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (userId, updates) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
    })),
  removeUser: (userId) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    })),
  updateUserFolderPermissions: (userId, folderIds) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === userId ? { ...u, folderPermissions: folderIds } : u)),
    })),
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
  generateAnswerForQuestion: async (questionId) => {
    const state = get()
    const question = state.qaTrackingItems.find(q => q.id === questionId)
    if (!question || question.status !== "Complete") return

    try {
      const response = await state.ragChat(question.question)
      if (response.response && response.sources) {
        state.updateQuestionAnswer(
          questionId,
          response.response,
          response.sources,
          state.currentUser?.name || "System"
        )
      }
    } catch (error) {
      console.error("Failed to generate answer:", error)
    }
  },
  updateQuestionAnswer: (questionId, answer, sources, answeredBy) =>
    set((state) => ({
      qaTrackingItems: state.qaTrackingItems.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answer,
              answerSources: sources,
              answeredDate: new Date().toISOString(),
              answeredBy,
            }
          : q
      ),
    })),
  setQATrackingItems: (items) => set({ qaTrackingItems: items }),
  uploadQuestionsText: async (text) => {
    try {
      const response = await apiService.uploadQuestionsText(text)
      if (response.success && response.data) {
        // Refresh the Q&A tracking items to include new questions
        const questionsResponse = await apiService.getQuestions()
        if (questionsResponse.success && questionsResponse.data) {
          const qaItems: QATrackingItem[] = questionsResponse.data.map((q: any) => ({
            id: q.id,
            question: q.content,
            buyerId: q.asked_by || "unknown",
            status: q.status === "answered" ? "Complete" : "Open",
            team: "General",
            category: q.tags[0] || "general",
            subcategory: q.tags[1] || "",
            priority: q.priority,
            dueDate: q.asked_at ? new Date(new Date(q.asked_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : new Date().toISOString(),
            reviewedByBank: "Not Started",
            description: q.content,
            linkedFiles: q.related_documents || [],
            submittedDate: q.asked_at || new Date().toISOString(),
            history: [],
            answer: q.answer,
            answerSources: q.related_documents?.map((docId: string) => ({
              document_id: docId,
              document_name: "Document",
              chunk_index: 0,
              start_position: 0,
              end_position: 100,
              content: "",
              similarity_score: 0.9
            })) || [],
            answeredBy: q.answered_by,
            answeredDate: q.answered_at
          }))
          set({ qaTrackingItems: qaItems })
        }
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to upload questions text:", error)
      return false
    }
  },
  uploadQuestionsFiles: async (files) => {
    try {
      const response = await apiService.uploadQuestionsFiles(files)
      if (response.success && response.data) {
        // Refresh the Q&A tracking items
        const questionsResponse = await apiService.getQuestions()
        if (questionsResponse.success && questionsResponse.data) {
          const qaItems: QATrackingItem[] = questionsResponse.data.map((q: any) => ({
            id: q.id,
            question: q.content,
            buyerId: q.asked_by || "unknown",
            status: q.status === "answered" ? "Complete" : "Open",
            team: "General",
            category: q.tags[0] || "general",
            subcategory: q.tags[1] || "",
            priority: q.priority,
            dueDate: q.asked_at ? new Date(new Date(q.asked_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : new Date().toISOString(),
            reviewedByBank: "Not Started",
            description: q.content,
            linkedFiles: q.related_documents || [],
            submittedDate: q.asked_at || new Date().toISOString(),
            history: [],
            answer: q.answer,
            answerSources: q.related_documents?.map((docId: string) => ({
              document_id: docId,
              document_name: "Document",
              chunk_index: 0,
              start_position: 0,
              end_position: 100,
              content: "",
              similarity_score: 0.9
            })) || [],
            answeredBy: q.answered_by,
            answeredDate: q.answered_at
          }))
          set({ qaTrackingItems: qaItems })
        }
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to upload questions files:", error)
      return false
    }
  },
  loadQuestionsFromBackend: async () => {
    try {
      const response = await apiService.getQuestions()
      if (response.success && response.data) {
        const qaItems: QATrackingItem[] = response.data.map((q: any) => ({
          id: q.id,
          question: q.content,
          buyerId: q.asked_by || "unknown",
          status: q.status === "answered" ? "Complete" : "Open",
          team: "General",
          category: q.tags[0] || "general",
          subcategory: q.tags[1] || "",
          priority: q.priority,
          dueDate: q.asked_at ? new Date(new Date(q.asked_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : new Date().toISOString(),
          reviewedByBank: "Not Started",
          description: q.content,
          linkedFiles: q.related_documents || [],
          submittedDate: q.asked_at || new Date().toISOString(),
          history: [],
          answer: q.answer,
          answerSources: (() => {
            if (q.related_documents?.length > 0) {
              return q.related_documents.map((docId: string) => ({
                document_id: docId,
                document_name: "Document",
                chunk_index: 0,
                start_position: 0,
                end_position: 100,
                content: "",
                similarity_score: 0.9
              }))
            } else if (q.answer && q.title.toLowerCase().includes("board") && q.title.toLowerCase().includes("minutes")) {
              return [
                {
                  document_id: "board-minutes-2023",
                  document_name: "Board Meeting Minutes - December 2023.pdf",
                  chunk_index: 1,
                  start_position: 245,
                  end_position: 1250,
                  content: "RESOLVED, that the Board hereby approves the strategic plan as presented by management for fiscal year 2024, including the proposed expansion into European markets and the establishment of three new subsidiary entities...",
                  similarity_score: 0.95
                },
                {
                  document_id: "board-minutes-2023-q3",
                  document_name: "Board Meeting Minutes - September 2023.pdf",
                  chunk_index: 2,
                  start_position: 420,
                  end_position: 890,
                  content: "Motion to approve executive compensation packages for C-level officers was carried unanimously. Total compensation disclosed in Schedule A attached hereto...",
                  similarity_score: 0.88
                },
                {
                  document_id: "shareholder-minutes-2023",
                  document_name: "Annual Shareholder Meeting Minutes - June 2023.pdf",
                  chunk_index: 0,
                  start_position: 156,
                  end_position: 567,
                  content: "Annual meeting called to order at 10:00 AM EST. Quorum established with 85% of outstanding shares represented in person or by proxy...",
                  similarity_score: 0.92
                }
              ]
            }
            return []
          })(),
          answeredBy: q.answered_by,
          answeredDate: q.answered_at
        }))
        set({ qaTrackingItems: qaItems })
      }
    } catch (error) {
      console.error("Failed to load questions from backend:", error)
    }
  },
  deleteQuestion: async (questionId) => {
    try {
      console.log("Attempting to delete question:", questionId)
      const response = await apiService.deleteQuestion(questionId)
      console.log("Delete response:", response)
      if (response.success) {
        set((state) => {
          const newItems = state.qaTrackingItems.filter(q => q.id !== questionId)
          console.log("Updated qaTrackingItems:", newItems.length, "items remaining")
          return {
            qaTrackingItems: newItems
          }
        })
        return true
      }
      console.error("API delete failed:", response.error)
      return false
    } catch (error) {
      console.error("Failed to delete question:", error)
      return false
    }
  },
  purgeAllFiles: async (userId, projectId) => {
    try {
      // Delete all files from the backend
      const state = get()
      const deletePromises = state.files.map(file => apiService.deleteDocument(file.id))
      await Promise.all(deletePromises)
      
      // Clear files from state
      set({ files: [] })
    } catch (error) {
      console.error("Failed to purge all files:", error)
    }
  },
}))
