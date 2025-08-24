import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { UploadQuestions } from "@/components/upload-questions"

export default function UploadQuestionsPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6">
          <BreadcrumbNav
            items={[
              { label: "Projects", href: "/projects" },
              { label: "Project Valley", href: "#" },
              { label: "Upload Questions", href: "#" },
            ]}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Upload Questions</h1>
            <p className="text-muted-foreground">Submit your due diligence questions via text input or file upload</p>
          </div>

          <UploadQuestions />
        </div>
      </div>
    </div>
  )
}
