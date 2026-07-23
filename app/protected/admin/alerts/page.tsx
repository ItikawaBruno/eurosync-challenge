import { PageHeader } from "@/components/platform/layout/page-header"
import { AlertsList } from "./_components/alerts-list"

export default function AdminAlertsPage() {
  return (
    <>
      <PageHeader
        title="Alertas pedagogicos"
        description="Acompanhe alertas de frequencia baixa, desempenho e engajamento dos alunos."
      />
      <AlertsList />
    </>
  )
}
