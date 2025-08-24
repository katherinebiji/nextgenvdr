import { create } from "zustand"
import { FileStorageManager } from "./file-storage"

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
  addFileWithContent: (file: File, content: ArrayBuffer, userId: string, projectId: string) => Promise<void>
  getProjectFiles: (userId: string, projectId: string) => File[]
  loadProjectFiles: (userId: string, projectId: string) => void
  deleteFile: (userId: string, projectId: string, fileId: string) => void
  downloadFile: (userId: string, projectId: string, fileId: string) => void
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
  addFileWithContent: async (file, content, userId, projectId) => {
    await FileStorageManager.storeFile(userId, projectId, file, content)
    set((state) => ({ files: [...state.files, file] }))
  },
  getProjectFiles: (userId, projectId) => {
    return FileStorageManager.getFiles(userId, projectId)
  },
  loadProjectFiles: (userId, projectId) => {
    const storedFiles = FileStorageManager.getFiles(userId, projectId)
    set({ files: storedFiles })
  },
  deleteFile: (userId, projectId, fileId) => {
    FileStorageManager.deleteFile(userId, projectId, fileId)
    set((state) => ({ files: state.files.filter(f => f.id !== fileId) }))
  },
  downloadFile: (userId, projectId, fileId) => {
    FileStorageManager.downloadFile(userId, projectId, fileId)
  },
  updateFileVisibility: (fileId, visibleTo) => {
    set((state) => {
      const updatedFiles = state.files.map((f) => (f.id === fileId ? { ...f, visibleTo } : f))
      
      // Also update in file storage if user and project are available
      const file = state.files.find(f => f.id === fileId)
      if (file && state.currentUser && state.currentProject) {
        FileStorageManager.updateFileVisibility(state.currentUser.id, state.currentProject.id, fileId, visibleTo)
      }
      
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
