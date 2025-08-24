"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Folder, Search, Filter, ArrowUpDown, Calendar, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TrackerItem } from "@/lib/store"

interface TrackerTableProps {
  items: TrackerItem[]
  onItemClick: (item: TrackerItem) => void
  selectedItemId?: string | null
}

export function TrackerTable({ items, onItemClick, selectedItemId }: TrackerTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [teamFilter, setTeamFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [sortField, setSortField] = useState<keyof TrackerItem>("dueDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.requestedItem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.indexLink.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "All" || item.status === statusFilter
    const matchesTeam = teamFilter === "All" || item.team === teamFilter
    const matchesPriority = priorityFilter === "All" || item.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesTeam && matchesPriority
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    const direction = sortDirection === "asc" ? 1 : -1

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue) * direction
    }
    return 0
  })

  const handleSort = (field: keyof TrackerItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getStatusBadge = (status: TrackerItem["status"]) => {
    switch (status) {
      case "Complete":
        return <Badge className="bg-secondary text-secondary-foreground">Complete</Badge>
      case "In Progress":
        return <Badge className="bg-primary text-primary-foreground">In Progress</Badge>
      case "Open":
        return <Badge variant="outline">Open</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getReviewBadge = (reviewed: TrackerItem["reviewedByBank"]) => {
    switch (reviewed) {
      case "Yes":
        return <Badge className="bg-secondary text-secondary-foreground">Yes</Badge>
      case "In Progress":
        return <Badge className="bg-primary text-primary-foreground">In Progress</Badge>
      case "Not Started":
        return <Badge variant="outline">Not Started</Badge>
      default:
        return <Badge variant="outline">{reviewed}</Badge>
    }
  }

  const getPriorityBadge = (priority: TrackerItem["priority"]) => {
    switch (priority) {
      case "High":
        return <Badge variant="destructive">High</Badge>
      case "Medium":
        return <Badge className="bg-primary text-primary-foreground">Medium</Badge>
      case "Low":
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trackers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Complete">Complete</SelectItem>
            </SelectContent>
          </Select>

          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Teams</SelectItem>
              <SelectItem value="Seller">Seller</SelectItem>
              <SelectItem value="Legal">Legal</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Priority</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50">
            <TableRow>
              <TableHead className="w-[200px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort("indexLink")}
                >
                  Index Link
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort("status")}
                >
                  Status
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort("team")}
                >
                  Team
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[250px]">Requested Item</TableHead>
              <TableHead>Reviewed by Bank?</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort("dueDate")}
                >
                  Due Date
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort("priority")}
                >
                  Priority
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item) => (
              <TableRow
                key={item.id}
                className={cn("cursor-pointer hover:bg-muted/50", selectedItemId === item.id && "bg-accent")}
                onClick={() => onItemClick(item)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-primary underline">{item.indexLink}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    {item.team}
                  </div>
                </TableCell>
                <TableCell className="max-w-[250px]">
                  <div className="truncate" title={item.requestedItem}>
                    {item.requestedItem}
                  </div>
                </TableCell>
                <TableCell>{getReviewBadge(item.reviewedByBank)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(item.dueDate)}
                  </div>
                </TableCell>
                <TableCell>{getPriorityBadge(item.priority)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sortedItems.length === 0 && (
        <div className="text-center py-8">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No trackers found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
