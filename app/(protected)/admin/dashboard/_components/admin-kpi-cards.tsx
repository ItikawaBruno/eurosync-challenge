"use client"

import { AlertTriangle, School, TrendingUp, Users } from "lucide-react"
import { MetricCard } from "@/components/platform/ui/metric-card"
import { MetricsSkeleton } from "@/components/platform/ui/loading"
import { useAdminDashboard } from "@/hooks/use-dashboard"

export function AdminKpiCards() {
  const { data, isPending } = useAdminDashboard()

  if (isPending) return <MetricsSkeleton count={4} />

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard title="Total de alunos" value={String(data?.totalStudents ?? 0)} description="educandos cadastrados" trend="up" trendLabel="+8%" icon={<Users className="h-5 w-5" />} />
      <MetricCard title="Turmas ativas" value={String(data?.totalClasses ?? 0)} description="acoes presenciais em curso" icon={<School className="h-5 w-5" />} />
      <MetricCard title="Presenca media" value={`${data?.averageAttendance ?? 0}%`} description="ultimos 30 dias" trend="up" trendLabel="+3%" icon={<TrendingUp className="h-5 w-5" />} />
      <MetricCard title="Alunos em risco" value={String(data?.studentsAtRisk ?? 0)} description="requerem acompanhamento" trend="down" trendLabel="-2" icon={<AlertTriangle className="h-5 w-5" />} />
    </div>
  )
}


