import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { BulkUploadZone } from "@/components/bulk-upload-zone"

export default function UploadBulkPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6">
          <BreadcrumbNav
            items={[
              { label: "Projects", href: "/projects" },
              { label: "TechCorp Acquisition", href: "#" },
              { label: "Upload Bulk Files", href: "#" },
            ]}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <BulkUploadZone />
        </div>
      </div>
    </div>
  )
}
