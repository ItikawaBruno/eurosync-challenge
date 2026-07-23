import { PageHeader } from "@/components/platform/layout/page-header"
import { LmsIntegrationPanel } from "./_components/lms-integration-panel"

export default function AdminLmsIntegrationPage() {
  return (
    <>
      <PageHeader title="Integracao LMS" description="Configure e sincronize suas turmas com a plataforma de ensino." />
      <LmsIntegrationPanel />
    </>
  )
}
