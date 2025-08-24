"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, X, Send, Loader2, FileText, Eye } from "lucide-react"
import { DocumentPreviewModal } from "./document-preview-modal"
import { useAppStore } from "@/lib/store"

interface Source {
  document_id: string
  document_name: string
  chunk_index: number
  start_position: number
  end_position: number
  content: string
  similarity_score: number
}

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
  sources?: Source[]
  usedDocuments?: boolean
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI assistant. I can help you with document analysis and Q&A tracking using your uploaded documents.",
      isBot: true,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(null)
  const [previewHighlights, setPreviewHighlights] = useState<any[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { ragChat } = useAppStore()

  // Toggle between mock and real API - change this to false to use localhost
  const useMockAPI = false

  const sendMockResponse = async (message: string, onChunk: (chunk: string) => void) => {
    // Mock streaming responses based on user input
    const mockResponses = [
      "I'd be happy to help you with your Q&A tracking! Based on your message, I can assist with organizing your due diligence questions, tracking response status, and managing document requests. What specific aspect would you like to focus on?",
      "Great question! For Q&A tracking in virtual data rooms, I recommend categorizing questions by topic (legal, financial, operational, etc.), setting priority levels, and establishing clear timelines for responses. Would you like me to explain any of these areas in more detail?",
      "I can help you streamline your Q&A process. This typically involves creating standardized question templates, setting up automated reminders for pending responses, and maintaining clear audit trails. What's your current biggest challenge with Q&A management?",
      "Virtual data room Q&A tracking is crucial for successful due diligence. I can guide you through best practices like maintaining response logs, ensuring proper document indexing, and managing stakeholder communications. What would be most helpful for your current process?"
    ]

    // Select a random response (like localhost would return varied responses)
    const responseText = mockResponses[Math.floor(Math.random() * mockResponses.length)]

    // Simulate SSE streaming with proper chunks like localhost would
    return new Promise<void>((resolve, reject) => {
      // Split into realistic chunks (1-4 words per chunk like real streaming)
      const words = responseText.split(' ')
      const chunks: string[] = []
      
      for (let i = 0; i < words.length; i += Math.floor(Math.random() * 3) + 1) {
        const chunkWords = words.slice(i, i + Math.floor(Math.random() * 3) + 1)
        chunks.push(chunkWords.join(' ') + (i + chunkWords.length < words.length ? ' ' : ''))
      }

      let chunkIndex = 0
      const timeoutId = setTimeout(() => {
        reject(new Error('Mock request timeout'))
      }, 30000) // 30 second timeout like real requests

      const sendNextChunk = () => {
        if (chunkIndex >= chunks.length) {
          clearTimeout(timeoutId)
          resolve()
          return
        }

        try {
          // Simulate network delay variability (20-200ms like real streaming)
          const delay = Math.random() * 180 + 20
          
          setTimeout(() => {
            if (chunkIndex < chunks.length) {
              onChunk(chunks[chunkIndex])
              chunkIndex++
              sendNextChunk()
            }
          }, delay)
        } catch (error) {
          clearTimeout(timeoutId)
          reject(error)
        }
      }

      // Initial delay to simulate connection time
      setTimeout(() => {
        sendNextChunk()
      }, Math.random() * 200 + 100)
    })
  }

  const sendLocalhostRequest = async (message: string, onChunk: (chunk: string) => void) => {
    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, stream: true }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6)
            if (data === '[DONE]') {
              return
            }
            try {
              const parsed = JSON.parse(data)
              const chunk = parsed.content || parsed.text || parsed.delta || ''
              if (chunk) {
                onChunk(chunk)
              }
            } catch (e) {
              // If not JSON, treat as plain text chunk
              if (data) {
                onChunk(data)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat API error:', error)
      throw error
    }
  }

  const sendChatMessage = async (message: string, onChunk: (chunk: string) => void, onComplete: (sources?: Source[]) => void) => {
    try {
      if (useMockAPI) {
        await sendMockResponse(message, onChunk)
        onComplete()
      } else {
        // Use the real RAG API
        const chatHistory = messages.slice(-10).map(msg => ({
          role: msg.isBot ? "assistant" : "user",
          content: msg.text
        }))
        
        const response = await ragChat(message, chatHistory)
        
        // Stream the response
        for (const char of response.response) {
          onChunk(char)
          await new Promise(resolve => setTimeout(resolve, 10))
        }
        
        // Parse sources from response
        const sources: Source[] = response.sources?.map((source: any) => ({
          document_id: source.document_id,
          document_name: source.document_name,
          chunk_index: source.chunk_index,
          start_position: source.start_position,
          end_position: source.end_position,
          content: source.content,
          similarity_score: source.similarity_score
        })) || []
        
        onComplete(sources)
      }
    } catch (error) {
      console.error('Chat message error:', error)
      onChunk("I'm having trouble connecting to the chat service. Please try again later.")
      onComplete()
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const messageText = inputValue
    setInputValue("")
    setIsLoading(true)

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])

    // Create initial bot message for streaming
    const botMessageId = (Date.now() + 1).toString()
    const initialBotMessage: Message = {
      id: botMessageId,
      text: "",
      isBot: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, initialBotMessage])

    // Handle streaming response
    try {
      await sendChatMessage(
        messageText, 
        (chunk: string) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, text: msg.text + chunk }
                : msg
            )
          )
        },
        (sources?: Source[]) => {
          // Update the message with sources when complete
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, sources, usedDocuments: Boolean(sources?.length) }
                : msg
            )
          )
        }
      )
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: "Sorry, I encountered an error. Please try again." }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }, [messages])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-96 h-[500px] shadow-lg border rounded-lg overflow-hidden bg-white">
          <div className="flex flex-row items-center justify-between px-3 py-1.5 border-b rounded-t-lg" style={{ backgroundColor: '#9333ea' }}>
            <h3 className="text-xs font-medium text-white">AI Assistant</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0 hover:bg-purple-700 text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex flex-col h-[calc(100%-36px)]">
            {/* Messages */}
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`max-w-[85%] space-y-2`}>
                      <div
                        className={`p-3 rounded-lg text-sm leading-relaxed break-words whitespace-pre-wrap ${
                          message.isBot
                            ? "bg-muted text-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {message.text}
                      </div>
                      
                      {/* Source Attribution for Bot Messages */}
                      {message.isBot && message.sources && message.sources.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              {message.sources.length} source{message.sources.length !== 1 ? 's' : ''}
                            </Badge>
                            {message.usedDocuments && (
                              <Badge variant="secondary" className="text-xs">
                                Document analysis used
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            {message.sources.slice(0, 3).map((source, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-background border rounded text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  <span className="truncate font-medium">{source.document_name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(source.similarity_score * 100)}%
                                  </Badge>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    setPreviewDocumentId(source.document_id)
                                    setPreviewHighlights([{
                                      chunk_id: `${source.document_id}_${source.chunk_index}`,
                                      start_position: source.start_position,
                                      end_position: source.end_position,
                                      content: source.content
                                    }])
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            
                            {message.sources.length > 3 && (
                              <div className="text-xs text-muted-foreground text-center py-1">
                                +{message.sources.length - 3} more sources
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground p-3 rounded-lg text-sm leading-relaxed flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="border-t p-4 bg-background mt-auto">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 min-h-[40px]"
                />
                <Button 
                  onClick={handleSend} 
                  size="sm"
                  className="px-3 py-2 min-h-[40px]"
                  disabled={!inputValue.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewDocumentId}
        onClose={() => {
          setPreviewDocumentId(null)
          setPreviewHighlights([])
        }}
        documentId={previewDocumentId || ""}
        highlightChunks={previewHighlights}
        title="Source Document"
      />
    </div>
  )
}
