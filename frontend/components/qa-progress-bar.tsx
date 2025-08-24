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
    <div className={`w-full bg-gradient-to-r from-background to-muted/20 border border-border rounded-lg p-3 ${className}`}>
      {/* Multi-segment progress bar */}
      <div className="relative h-2 mb-2 w-full bg-gray-200 rounded-full overflow-hidden">
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-purple-700">
            <div className="w-2.5 h-2.5 bg-purple-700 rounded-sm" />
            <span className="text-xs font-medium">{completedQuestions} Complete</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-400">
            <div className="w-2.5 h-2.5 bg-purple-400 rounded-sm" />
            <span className="text-xs font-medium">{inProgressQuestions} In Progress</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <div className="w-2.5 h-2.5 bg-gray-300 rounded-sm border border-gray-400" />
            <span className="text-xs font-medium">{openQuestions} Open</span>
          </div>
        </div>
      </div>
    </div>
  )
}
