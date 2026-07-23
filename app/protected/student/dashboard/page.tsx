import { PageHeader } from "@/components/platform/layout/page-header"
import { StudentDashboardContent } from "./-components/student-dashboard-content"

export default function StudentDashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard do Aluno" description="Resumo da frequência, alertas e atividades recentes." />
      <StudentDashboardContent />
    </>
  )
}
