import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateQAProgress(qaItems: any[], projectId: string) {
  // Filter QA items for the specific project (you can extend this logic based on your data structure)
  const projectQAItems = qaItems.filter(item => {
    // For now, we'll use all items, but you can add project-specific filtering logic here
    // Example: return item.projectId === projectId || item.buyerId.includes(projectId)
    return true
  })

  const totalQuestions = projectQAItems.length
  const completedQuestions = projectQAItems.filter(item => item.status === "Complete").length
  const inProgressQuestions = projectQAItems.filter(item => item.status === "In Progress").length
  const openQuestions = projectQAItems.filter(item => item.status === "Open").length
  const qaCompletionPct = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0

  return {
    totalQuestions,
    completedQuestions,
    inProgressQuestions,
    openQuestions,
    qaCompletionPct
  }
}
