"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { mockUsers } from "@/lib/mock-data"

interface UserProjectProviderProps {
  children: React.ReactNode
}

export function UserProjectProvider({ children }: UserProjectProviderProps) {
  const params = useParams()
  const projectId = params.projectId as string
  const { setCurrentUser, setCurrentProject } = useAppStore()

  useEffect(() => {
    // Set up test user and project based on CLAUDE.md test accounts
    const testUser = {
      id: "seller-test",
      name: "Test Seller",
      email: "seller@test.com",
      role: "Seller",
      access: { view: true, upload: true, qa: true, respond: true },
      folderPermissions: ["legal", "commercial", "financial", "hr", "ip", "it"],
    }

    const testProject = {
      id: projectId,
      name: projectId === "project-valley" ? "Project Valley" : "Project Cerebral",
      description: projectId === "project-valley" 
        ? "Healthcare services consolidation and expansion"
        : "Strategic acquisition of manufacturing assets",
      buyers: ["Buyer A", "Buyer B"],
      qaCompletionPct: projectId === "project-valley" ? 63 : 78,
      lastActivity: "2 hours ago",
      status: "Active",
      dueDate: projectId === "project-valley" ? "2024-02-28" : "2024-02-15",
    }

    setCurrentUser(testUser)
    setCurrentProject(testProject)
  }, [projectId, setCurrentUser, setCurrentProject])

  return <>{children}</>
}