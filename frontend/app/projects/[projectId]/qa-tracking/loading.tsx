import { Skeleton } from "@/components/ui/skeleton"

export default function QATrackingLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header Skeleton */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          {/* Toolbar Skeleton */}
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-10 w-64" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/50 p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
