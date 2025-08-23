"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuestions } from "./question-provider"
import { MessageSquare, Plus, X, AlertCircle, Clock, Zap } from "lucide-react"

export function QuestionForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { submitQuestion } = useQuestions()

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags((prev) => [...prev, tagInput.trim().toLowerCase()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setIsSubmitting(true)
    try {
      submitQuestion(title.trim(), content.trim(), priority, tags)
      setTitle("")
      setContent("")
      setPriority("medium")
      setTags([])
    } catch (error) {
      console.error("Failed to submit question:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityIcon = (p: string) => {
    switch (p) {
      case "high":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case "medium":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "low":
        return <Zap className="w-4 h-4 text-green-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "high":
        return "border-red-200 bg-red-50"
      case "medium":
        return "border-yellow-200 bg-yellow-50"
      case "low":
        return "border-green-200 bg-green-50"
      default:
        return "border-yellow-200 bg-yellow-50"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Ask a Question
        </CardTitle>
        <CardDescription>
          Submit questions to sellers about documents, processes, or any other information you need.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Question Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your question"
              required
              className="h-11"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              Question Details
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide detailed information about what you need to know..."
              required
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Priority Level</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as "low" | "medium" | "high")}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span>Low Priority</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span>Medium Priority</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>High Priority</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag (e.g., financial, legal, technical)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={!tagInput.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Priority Preview */}
          <div className={`p-4 rounded-lg border ${getPriorityColor(priority)}`}>
            <div className="flex items-center gap-2 mb-2">
              {getPriorityIcon(priority)}
              <span className="font-medium text-sm">
                Priority: {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              {priority === "high" && "Urgent question requiring immediate attention"}
              {priority === "medium" && "Standard question with normal response time"}
              {priority === "low" && "Non-urgent question, can be answered when convenient"}
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={!title.trim() || !content.trim() || isSubmitting} className="w-full h-11">
            {isSubmitting ? "Submitting..." : "Submit Question"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
