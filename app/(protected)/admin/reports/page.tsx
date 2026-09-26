import { PageHeader } from "@/components/platform/layout/page-header"
import { ReportsPanel } from "./_components/reports-panel"

export default function AdminReportsPage() {
  return (
    <>
      <PageHeader title="Relatorios" description="Visualize indicadores e acompanhe desempenho por periodo." />
      <ReportsPanel />
    </>
  )
}
