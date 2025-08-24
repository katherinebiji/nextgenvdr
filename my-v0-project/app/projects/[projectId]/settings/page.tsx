"use client"

import { useParams } from "next/navigation"
import { SettingsForm } from "@/components/settings-form"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { useAppStore } from "@/lib/store"

export default function SettingsPage() {
  const params = useParams()
  const { settings, updateSettings } = useAppStore()

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col gap-2">
            <BreadcrumbNav />
            <div>
              <h1 className="text-xl font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground">Configure data room preferences and security</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <SettingsForm settings={settings} onUpdateSettings={updateSettings} />
        </div>
      </div>
    </div>
  )
}
