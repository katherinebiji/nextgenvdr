"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import {
  FileText,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  Building2,
  Upload,
  HelpCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const sellSideNavigation = [
  { name: "Upload Bulk Files", href: "/upload-bulk", icon: Upload },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Q&A Tracking", href: "/qa-tracking", icon: MessageSquare },
  { name: "Users", href: "/users", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

const buySideNavigation = [
  { name: "Upload Questions", href: "/upload-questions", icon: HelpCircle },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Q&A Tracking", href: "/qa-tracking", icon: MessageSquare },
  { name: "Users", href: "/users", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
]

interface ProjectLayoutProps {
  children: React.ReactNode
}

export function ProjectLayout({ children }: ProjectLayoutProps) {
  const pathname = usePathname()
  const params = useParams()
  const projectId = params.projectId as string

  const isBuySide = projectId === "project-valley"
  const navigation = isBuySide ? buySideNavigation : sellSideNavigation
  const projectName = isBuySide ? "Project Valley" : "TechCorp Acquisition"
  const projectType = isBuySide ? "Buy-Side Due Diligence" : "Due Diligence"

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col">
        {/* Project Header */}
        <div className="p-4 border-b border-border">
          <Link
            href="/projects"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Projects
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">{projectName}</h2>
              <p className="text-sm text-muted-foreground">{projectType}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const href = `/projects/${projectId}${item.href}`
              const isActive = pathname === href

              return (
                <li key={item.name}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <p>VDR v2.1.0</p>
            <p>© 2024 Enterprise Banking</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  )
}
