import type React from "react"
import { ProjectLayout } from "@/components/project-layout"
import { UserProjectProvider } from "@/components/user-project-provider"

export default function ProjectLayoutPage({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProjectProvider>
      <ProjectLayout>{children}</ProjectLayout>
    </UserProjectProvider>
  )
}
