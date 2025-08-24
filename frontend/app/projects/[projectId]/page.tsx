"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  useEffect(() => {
    const isBuySide = projectId === "project-valley"
    
    if (isBuySide) {
      // Buy-side DD opens to Upload Questions tab by default
      router.replace(`/projects/${projectId}/upload-questions`)
    } else {
      // Sell-side DD opens to Q&A Tracking tab by default
      router.replace(`/projects/${projectId}/qa-tracking`)
    }
  }, [projectId, router])

  return null
}