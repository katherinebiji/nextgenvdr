import type React from "react"
import { ProjectLayout } from "@/components/project-layout"

export default function ProjectLayoutPage({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProjectLayout>{children}</ProjectLayout>
}
