import { PageHeader } from "@/components/platform/layout/page-header"
import { AdminKpiCards } from "./_components/admin-kpi-cards"
import { AdminDashboardSections } from "./_components/admin-dashboard-sections"

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader title="Painel Administrativo" description="Indicadores gerais da plataforma, alertas e operacoes recentes." />
      <AdminKpiCards />
      <AdminDashboardSections />
    </>
  )
}
