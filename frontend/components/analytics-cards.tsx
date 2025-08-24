"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Eye, MessageSquare, Clock, Users, FileText, Activity, Folder } from "lucide-react"

interface AnalyticsCardsProps {
  data: {
    topViewedFolders: Array<{
      name: string
      path: string
      views: number
      trend: string
    }>
    recentActivity: Array<{
      id: string
      type: string
      user: string
      action: string
      item: string
      folder: string
      timestamp: string
    }>
    qaThroughput: {
      totalQuestions: number
      answeredQuestions: number
      pendingQuestions: number
      averageResponseTime: string
      weeklyData: Array<{
        day: string
        submitted: number
        answered: number
      }>
    }
    documentStats: {
      totalDocuments: number
      documentsThisWeek: number
      totalSize: string
      averageFileSize: string
    }
    userActivity: {
      activeUsers: number
      totalLogins: number
      peakHours: string
      mostActiveUser: string
    }
  }
}

export function AnalyticsCards({ data }: AnalyticsCardsProps) {
  const getTrendIcon = (trend: string) => {
    return trend.startsWith("+") ? (
      <TrendingUp className="h-4 w-4 text-secondary" />
    ) : (
      <TrendingDown className="h-4 w-4 text-destructive" />
    )
  }

  const getTrendColor = (trend: string) => {
    return trend.startsWith("+") ? "text-secondary" : "text-destructive"
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "upload":
        return <FileText className="h-4 w-4 text-primary" />
      case "question":
        return <MessageSquare className="h-4 w-4 text-secondary" />
      case "review":
        return <Eye className="h-4 w-4 text-accent" />
      case "access":
        return <Users className="h-4 w-4 text-muted-foreground" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return date.toLocaleDateString()
  }

  const completionRate = Math.round((data.qaThroughput.answeredQuestions / data.qaThroughput.totalQuestions) * 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Top Viewed Folders */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Top Viewed Folders
          </CardTitle>
          <CardDescription>Most accessed document folders this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topViewedFolders.map((folder, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{folder.name}</div>
                    <div className="text-sm text-muted-foreground">{folder.path}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{folder.views} views</span>
                  <div className={`flex items-center gap-1 ${getTrendColor(folder.trend)}`}>
                    {getTrendIcon(folder.trend)}
                    <span className="text-sm">{folder.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Stats
          </CardTitle>
          <CardDescription>Document repository overview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Documents</span>
              <span className="font-medium">{data.documentStats.totalDocuments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Added This Week</span>
              <span className="font-medium text-secondary">+{data.documentStats.documentsThisWeek}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Size</span>
              <span className="font-medium">{data.documentStats.totalSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg File Size</span>
              <span className="font-medium">{data.documentStats.averageFileSize}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Q&A Throughput */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Q&A Throughput (Last 7 Days)
          </CardTitle>
          <CardDescription>Question submission and response activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{data.qaThroughput.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{data.qaThroughput.answeredQuestions}</div>
                <div className="text-sm text-muted-foreground">Answered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{data.qaThroughput.pendingQuestions}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
                <span>{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.qaThroughput.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="submitted" fill="hsl(var(--primary))" name="Submitted" />
                  <Bar dataKey="answered" fill="hsl(var(--secondary))" name="Answered" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Average response time: {data.qaThroughput.averageResponseTime}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Activity
          </CardTitle>
          <CardDescription>User engagement metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Users</span>
              <span className="font-medium">{data.userActivity.activeUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Logins</span>
              <span className="font-medium">{data.userActivity.totalLogins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Peak Hours</span>
              <span className="font-medium">{data.userActivity.peakHours}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Most Active</span>
              <span className="font-medium">{data.userActivity.mostActiveUser}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest actions across the data room</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                    <span className="font-medium">{activity.item}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Folder className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{activity.folder}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
