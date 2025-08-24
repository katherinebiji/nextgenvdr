"use client"

import { useParams } from "next/navigation"
import { AnalyticsCards } from "@/components/analytics-cards"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { mockAnalyticsData } from "@/lib/mock-data"

export default function AnalyticsPage() {
  const params = useParams()

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col gap-2">
            <BreadcrumbNav />
            <div>
              <h1 className="text-xl font-semibold">Analytics</h1>
              <p className="text-sm text-muted-foreground">Data room insights and activity metrics</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnalyticsCards data={mockAnalyticsData} />
      </div>
    </div>
  )
}
