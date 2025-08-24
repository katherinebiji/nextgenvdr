"use client"

import React from "react"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Circle } from "lucide-react"

interface QAProgressBarProps {
  totalQuestions: number
  completedQuestions: number
  inProgressQuestions: number
  openQuestions: number
  className?: string
}

export function QAProgressBar({ 
  totalQuestions, 
  completedQuestions, 
  inProgressQuestions, 
  openQuestions,
  className = ""
}: QAProgressBarProps) {
  const completionPercentage = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0
  const inProgressPercentage = totalQuestions > 0 ? (inProgressQuestions / totalQuestions) * 100 : 0
  const openPercentage = totalQuestions > 0 ? (openQuestions / totalQuestions) * 100 : 0

  return (
    <div className={`w-full bg-gradient-to-r from-background to-muted/20 border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Q&A Progress Overview</h3>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {completedQuestions} of {totalQuestions} questions completed
          </span>
        </div>
        <div className="text-2xl font-bold text-primary">
          {Math.round(completionPercentage)}%
        </div>
      </div>
      
      {/* Multi-segment progress bar */}
      <div className="relative h-3 mb-4 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          {/* Complete segment - darkest purple */}
          <div 
            className="bg-purple-700 h-full" 
            style={{ width: `${completionPercentage}%` }}
          />
          {/* In Progress segment - medium purple */}
          <div 
            className="bg-purple-400 h-full" 
            style={{ width: `${inProgressPercentage}%` }}
          />
          {/* Open segment - grey */}
          <div 
            className="bg-gray-300 h-full" 
            style={{ width: `${openPercentage}%` }}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-purple-700">
            <div className="w-3 h-3 bg-purple-700 rounded-sm" />
            <span className="text-sm font-medium">{completedQuestions} Complete</span>
          </div>
          <div className="flex items-center gap-2 text-purple-400">
            <div className="w-3 h-3 bg-purple-400 rounded-sm" />
            <span className="text-sm font-medium">{inProgressQuestions} In Progress</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-3 h-3 bg-gray-300 rounded-sm border border-gray-400" />
            <span className="text-sm font-medium">{openQuestions} Open</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {totalQuestions > 0 ? `${completedQuestions} of ${totalQuestions} addressed` : 'No questions yet'}
        </div>
      </div>
    </div>
  )
}
