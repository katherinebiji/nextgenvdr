"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, Users, Shield, Bell, Database, Zap, HardDrive, Trash2, AlertTriangle } from "lucide-react"
import type { Settings as SettingsType } from "@/lib/store"
import { FileStorageManager } from "@/lib/file-storage"
import { useAppStore } from "@/lib/store"

interface SettingsFormProps {
  settings: SettingsType
  onUpdateSettings: (newSettings: Partial<SettingsType>) => void
}

export function SettingsForm({ settings, onUpdateSettings }: SettingsFormProps) {
  const [localSettings, setLocalSettings] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)
  const [storageInfo, setStorageInfo] = useState(FileStorageManager.getStorageInfo())
  
  const { currentUser, currentProject, purgeAllFiles } = useAppStore()
  
  const refreshStorageInfo = () => {
    setStorageInfo(FileStorageManager.getStorageInfo())
  }
  
  const handlePurgeAllData = () => {
    const confirmText = 'PURGE ALL DATA'
    const userInput = prompt(
      `⚠️ EXTREME DANGER: This will permanently delete ALL documents from ALL projects.\n\n` +
      `This includes ${storageInfo.totalFiles} files (${storageInfo.sizeFormatted}).\n\n` +
      `This action cannot be undone!\n\n` +
      `Type "${confirmText}" to confirm:`
    )
    
    if (userInput === confirmText) {
      FileStorageManager.purgeAllData()
      refreshStorageInfo()
      alert('All data has been permanently deleted.')
    }
  }
  
  const handlePurgeCurrentProject = () => {
    if (!currentUser || !currentProject) return
    
    const confirmText = 'DELETE PROJECT DATA'
    const userInput = prompt(
      `⚠️ DANGER: This will permanently delete ALL documents in the current project.\n\n` +
      `This action cannot be undone!\n\n` +
      `Type "${confirmText}" to confirm:`
    )
    
    if (userInput === confirmText) {
      purgeAllFiles(currentUser.id, currentProject.id)
      refreshStorageInfo()
      alert('Current project documents have been deleted.')
    }
  }

  const handleSettingChange = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onUpdateSettings(localSettings)
    setHasChanges(false)
  }

  const handleReset = () => {
    setLocalSettings(settings)
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      {/* Save/Reset Actions */}
      {hasChanges && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">You have unsaved changes</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Buyer Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Buyer Management
          </CardTitle>
          <CardDescription>Configure how buyers interact with the data room</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="multiple-buyers">Multiple Buyers</Label>
              <div className="text-sm text-muted-foreground">
                Allow multiple buyer groups to access different document sets
              </div>
            </div>
            <Switch
              id="multiple-buyers"
              checked={localSettings.multipleBuyersEnabled}
              onCheckedChange={(checked) => handleSettingChange("multipleBuyersEnabled", checked)}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Default Buyer Visibility</Label>
            <div className="text-sm text-muted-foreground mb-2">
              Default visibility setting for newly uploaded documents
            </div>
            <Select
              value={localSettings.defaultBuyerVisibility === "All" ? "All" : "Specific"}
              onValueChange={(value) =>
                handleSettingChange("defaultBuyerVisibility", value === "All" ? "All" : ["Buyer A"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Buyers</SelectItem>
                <SelectItem value="Specific">Specific Buyers Only</SelectItem>
              </SelectContent>
            </Select>
            {localSettings.defaultBuyerVisibility !== "All" && (
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">Buyer A</Badge>
                <Badge variant="outline">+ Add More</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Privacy
          </CardTitle>
          <CardDescription>Control document exposure and access security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="confirm-exposure">Confirm Before Exposing</Label>
              <div className="text-sm text-muted-foreground">
                Require confirmation before making documents visible to buyers
              </div>
            </div>
            <Switch
              id="confirm-exposure"
              checked={localSettings.confirmBeforeExposing}
              onCheckedChange={(checked) => handleSettingChange("confirmBeforeExposing", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-categorization">Auto-Categorization</Label>
              <div className="text-sm text-muted-foreground">Automatically suggest document categories using AI</div>
            </div>
            <Switch
              id="auto-categorization"
              checked={localSettings.autoCategorizationEnabled}
              onCheckedChange={(checked) => handleSettingChange("autoCategorizationEnabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <div className="text-sm text-muted-foreground">Receive email alerts for important events</div>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="qa-notifications">Q&A Notifications</Label>
              <div className="text-sm text-muted-foreground">Get notified when new questions are submitted</div>
            </div>
            <Switch id="qa-notifications" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="upload-notifications">Upload Notifications</Label>
              <div className="text-sm text-muted-foreground">Alerts when documents are uploaded or modified</div>
            </div>
            <Switch id="upload-notifications" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Configure data retention and backup settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Document Retention Period</Label>
            <Select defaultValue="1-year">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6-months">6 Months</SelectItem>
                <SelectItem value="1-year">1 Year</SelectItem>
                <SelectItem value="2-years">2 Years</SelectItem>
                <SelectItem value="indefinite">Indefinite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-backup">Automatic Backups</Label>
              <div className="text-sm text-muted-foreground">Automatically backup data room contents</div>
            </div>
            <Switch id="auto-backup" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance
          </CardTitle>
          <CardDescription>Optimize data room performance and loading</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="lazy-loading">Lazy Loading</Label>
              <div className="text-sm text-muted-foreground">Load documents on demand to improve performance</div>
            </div>
            <Switch id="lazy-loading" defaultChecked />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Cache Duration</Label>
            <Select defaultValue="24-hours">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-hour">1 Hour</SelectItem>
                <SelectItem value="6-hours">6 Hours</SelectItem>
                <SelectItem value="24-hours">24 Hours</SelectItem>
                <SelectItem value="7-days">7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Storage Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Management
          </CardTitle>
          <CardDescription>Monitor and manage document storage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total Documents</Label>
              <div className="text-2xl font-bold">{storageInfo.totalFiles}</div>
              <div className="text-xs text-muted-foreground">files stored locally</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Storage Used</Label>
              <div className="text-2xl font-bold">{storageInfo.sizeFormatted}</div>
              <div className="text-xs text-muted-foreground">in browser storage</div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">Data Management Actions</Label>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={refreshStorageInfo}
                className="w-full justify-start"
              >
                <Database className="h-4 w-4 mr-2" />
                Refresh Storage Info
              </Button>
              
              {currentUser && currentProject && (
                <Button
                  variant="destructive"
                  onClick={handlePurgeCurrentProject}
                  className="w-full justify-start"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Purge Current Project
                </Button>
              )}
              
              <Button
                variant="destructive"
                onClick={handlePurgeAllData}
                className="w-full justify-start border-red-600 bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Purge All Data
              </Button>
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Purge operations permanently delete documents and cannot be undone. 
                  Consider backing up important documents before purging.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
