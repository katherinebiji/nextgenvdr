interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

interface LoginResponse {
  access_token: string
  token_type: string
}

interface DocumentUploadResponse {
  id: string
  name: string
  size: number
  type: string
  tags: string[]
  uploaded_by: string
  uploaded_at: string
  summary: string | null
}

interface RAGChatResponse {
  response: string
  used_documents: boolean
  sources: string[]
  success: boolean
  message_type: string
}

class ApiService {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      
      const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (this.token) {
        defaultHeaders['Authorization'] = `Bearer ${this.token}`
      }

      const config: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      }

      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()
      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Authentication
  async login(email: string, password: string, name: string, role: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    })

    if (response.success && response.data) {
      this.token = response.data.access_token
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', this.token)
      }
    }

    return response
  }

  async register(email: string, password: string, name: string, role: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    })
  }

  logout() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  // Documents
  async uploadDocument(file: File, tags: string[]): Promise<ApiResponse<DocumentUploadResponse>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('tags', JSON.stringify(tags))

    const response = await this.makeRequest<DocumentUploadResponse>('/documents/upload', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    })

    return response
  }

  async getDocuments(): Promise<ApiResponse<DocumentUploadResponse[]>> {
    return this.makeRequest('/documents/')
  }

  async getDocument(documentId: string): Promise<ApiResponse<DocumentUploadResponse>> {
    return this.makeRequest(`/documents/${documentId}`)
  }

  async deleteDocument(documentId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/documents/${documentId}`, {
      method: 'DELETE',
    })
  }

  // Questions
  async createQuestion(question: {
    title: string
    content: string
    priority: string
    tags: string[]
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/questions/', {
      method: 'POST',
      body: JSON.stringify(question),
    })
  }

  async getQuestions(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/questions/')
  }

  async getQuestion(questionId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/questions/${questionId}`)
  }

  async updateQuestion(questionId: string, updates: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // AI and RAG Endpoints
  async analyzeDocument(documentId: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/ai/analyze-document', {
      method: 'POST',
      body: JSON.stringify({ document_id: documentId }),
    })
  }

  async processDocumentForRAG(documentId: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/ai/process-document-for-rag', {
      method: 'POST',
      body: JSON.stringify({ document_id: documentId }),
    })
  }

  async ragChat(message: string, chatHistory: Array<{role: string, content: string}> = []): Promise<ApiResponse<RAGChatResponse>> {
    return this.makeRequest('/ai/rag-chat', {
      method: 'POST',
      body: JSON.stringify({ message, chat_history: chatHistory }),
    })
  }

  async ragAnswerQuestion(questionId: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/ai/rag-answer-question', {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId }),
    })
  }

  async ragAnswerWithDocuments(questionId: string, documentIds: string[]): Promise<ApiResponse<any>> {
    return this.makeRequest('/ai/rag-answer-with-documents', {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, document_ids: documentIds }),
    })
  }

  async ragSearch(query: string, k: number = 5, scoreThreshold: number = 0.7): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      query,
      k: k.toString(),
      score_threshold: scoreThreshold.toString(),
    })
    return this.makeRequest(`/ai/rag-search?${params}`)
  }

  async getRagStatus(): Promise<ApiResponse<any>> {
    return this.makeRequest('/ai/rag-status')
  }

  async bulkProcessDocumentsForRAG(): Promise<ApiResponse<any>> {
    return this.makeRequest('/ai/bulk-process-documents-for-rag', {
      method: 'POST',
    })
  }

  async suggestDocuments(questionId: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/ai/suggest-documents', {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId }),
    })
  }

  async generateAnswer(questionId: string, documentIds: string[]): Promise<ApiResponse<any>> {
    return this.makeRequest('/ai/generate-answer', {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, document_ids: documentIds }),
    })
  }

  async extractTags(documentId: string): Promise<ApiResponse<string[]>> {
    return this.makeRequest('/ai/extract-tags', {
      method: 'POST',
      body: JSON.stringify({ document_id: documentId }),
    })
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  getToken(): string | null {
    return this.token
  }
}

export const apiService = new ApiService()
export default apiService