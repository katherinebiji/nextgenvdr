"use client"

import { usePathname, useParams } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

const pathLabels: Record<string, string> = {
  projects: "Projects",
  documents: "Documents",
  trackers: "Trackers",
  qna: "Q&A",
  users: "Users",
  analytics: "Analytics",
  settings: "Settings",
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  const params = useParams()

  const pathSegments = pathname.split("/").filter(Boolean)
  const projectId = params.projectId as string

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link href="/" className="flex items-center hover:text-foreground">
        <Home className="h-4 w-4" />
      </Link>

      {pathSegments.map((segment, index) => {
        const href = "/" + pathSegments.slice(0, index + 1).join("/")
        const isLast = index === pathSegments.length - 1
        const label = segment === projectId ? "TechCorp Acquisition" : pathLabels[segment] || segment

        return (
          <div key={segment} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground">
                {label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
