import { AuthProvider } from "@/components/auth-provider"
import { AuthGuard } from "@/components/auth-guard"
import { Dashboard } from "@/components/dashboard"
import { DocumentProvider } from "@/components/document-provider"
import { QuestionProvider } from "@/components/question-provider"
import { DocumentQuestionRouter } from "@/components/document-question-router"

export default function Home() {
  return (
    <AuthProvider>
      <DocumentProvider>
        <QuestionProvider>
          <DocumentQuestionRouter>
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          </DocumentQuestionRouter>
        </QuestionProvider>
      </DocumentProvider>
    </AuthProvider>
  )
}
