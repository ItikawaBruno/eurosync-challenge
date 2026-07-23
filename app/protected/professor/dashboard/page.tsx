import { PageHeader } from "@/components/platform/layout/page-header"
import { ProfessorDashboardContent } from "./_components/professor-dashboard-content"

export default function ProfessorDashboardPage() {
  return (
    <>
      <PageHeader title="Painel do Professor" description="Visão geral da turma, alertas e próximos eventos." />
      <ProfessorDashboardContent />
    </>
  )
}
