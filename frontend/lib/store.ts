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
    try {
      const response = await fetch(`/api/documents/${documentId}/preview`)
      return await response.json()
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
}))
