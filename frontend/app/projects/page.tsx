"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Building2, Search, Users, MessageSquare, ChevronRight, Plus } from "lucide-react"

// Mock project data
const projects = [
  {
    id: "project-cerebral",
    name: "Project Cerebral",
    description: "Sell-side to a strategic buyer",
    buyers: ["Buyer A", "Buyer B"],
    qaCompletionPct: 78,
    lastActivity: "2 hours ago",
    status: "Active",
    dueDate: "2024-02-15",
  },

  {
    id: "project-valley",
    name: "Project Valley",
    description: "Strategic acquisition of large cap technology company",
    buyers: ["", ""],
    qaCompletionPct: 78,
    lastActivity: "4 hours ago",
    status: "Active",
    dueDate: "2024-02-28",
  },
]

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-secondary text-secondary-foreground"
      case "Due Diligence":
        return "bg-primary text-primary-foreground"
      case "Setup":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}/documents`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-serif">Virtual Data Room</h1>
                <p className="text-sm text-muted-foreground">Project Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold font-serif">Project Dashboard</h2>
              <p className="text-muted-foreground mt-1">Manage your active data rooms and transactions</p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleProjectClick(project.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-sm">{project.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Buyers or Process Type */}
                  {project.buyers.some(buyer => buyer.trim() !== '') ? (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {project.buyers.filter(buyer => buyer.trim() !== '').length} buyer{project.buyers.filter(buyer => buyer.trim() !== '').length !== 1 ? "s" : ""}
                      </span>
                      <div className="flex gap-1">
                        {project.buyers.filter(buyer => buyer.trim() !== '').map((buyer, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {buyer}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs">
                        Buy-Side Process
                      </Badge>
                    </div>
                  )}

                  {/* Q&A Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Q&A Progress</span>
                      <span className="font-medium">{project.qaCompletionPct}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-secondary h-2 rounded-full transition-all"
                        style={{ width: `${project.qaCompletionPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end pt-2 border-t border-border">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      <span>Open</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search terms" : "Create your first project to get started"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
