"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-provider"
import { Shield, LogOut, User } from "lucide-react"

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Virtual Data Room</h1>
              <p className="text-xs text-slate-500">Secure document platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-slate-700">{user?.name}</span>
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium capitalize">
                {user?.role}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
