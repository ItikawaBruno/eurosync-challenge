import { PageHeader } from "@/components/platform/layout/page-header"
import { AdminDashboardSections } from "./_components/admin-dashboard-sections"

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader title="Painel Administrativo" description="Indicadores gerais da plataforma, alertas e operacoes recentes." />
      <AdminDashboardSections />
    </>
  )
}
