import type { File } from "./store"

export interface StoredFile extends File {
  content: string // base64 encoded file content
}

export interface FileStorage {
  [userId: string]: {
    [projectId: string]: StoredFile[]
  }
}

const STORAGE_KEY = 'vdr_file_storage'

export class FileStorageManager {
  private static getStorage(): FileStorage {
    if (typeof window === 'undefined') return {}
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  private static saveStorage(storage: FileStorage): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
    } catch (error) {
      console.error('Failed to save file storage:', error)
    }
  }

  static async storeFile(
    userId: string, 
    projectId: string, 
    file: File, 
    fileContent: ArrayBuffer
  ): Promise<void> {
    const storage = this.getStorage()
    
    if (!storage[userId]) {
      storage[userId] = {}
    }
    
    if (!storage[userId][projectId]) {
      storage[userId][projectId] = []
    }

    // Convert ArrayBuffer to base64
    const base64Content = this.arrayBufferToBase64(fileContent)
    
    const storedFile: StoredFile = {
      ...file,
      content: base64Content
    }

    // Check if file already exists and update or add
    const existingIndex = storage[userId][projectId].findIndex(f => f.id === file.id)
    if (existingIndex >= 0) {
      storage[userId][projectId][existingIndex] = storedFile
    } else {
      storage[userId][projectId].push(storedFile)
    }

    this.saveStorage(storage)
  }

  static getFiles(userId: string, projectId: string): StoredFile[] {
    const storage = this.getStorage()
    return storage[userId]?.[projectId] || []
  }

  static getFile(userId: string, projectId: string, fileId: string): StoredFile | null {
    const files = this.getFiles(userId, projectId)
    return files.find(f => f.id === fileId) || null
  }

  static deleteFile(userId: string, projectId: string, fileId: string): void {
    const storage = this.getStorage()
    
    if (storage[userId]?.[projectId]) {
      storage[userId][projectId] = storage[userId][projectId].filter(f => f.id !== fileId)
      this.saveStorage(storage)
    }
  }

  static updateFileVisibility(
    userId: string, 
    projectId: string, 
    fileId: string, 
    visibleTo: string[] | "All"
  ): void {
    const storage = this.getStorage()
    
    if (storage[userId]?.[projectId]) {
      const fileIndex = storage[userId][projectId].findIndex(f => f.id === fileId)
      if (fileIndex >= 0) {
        storage[userId][projectId][fileIndex].visibleTo = visibleTo
        this.saveStorage(storage)
      }
    }
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  static downloadFile(userId: string, projectId: string, fileId: string): void {
    const file = this.getFile(userId, projectId, fileId)
    if (!file) return

    try {
      const buffer = this.base64ToArrayBuffer(file.content)
      const blob = new Blob([buffer])
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download file:', error)
    }
  }
}