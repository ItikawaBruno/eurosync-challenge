"use client"

import { AlertTriangle, School, TrendingUp, Users } from "lucide-react"
import { MetricCard } from "@/components/platform/ui/metric-card"
import { MetricsSkeleton } from "@/components/platform/ui/loading"
import { useAdminDashboard } from "@/hooks/use-dashboard"

// Rótulos de tendência derivados do banco. Retornam undefined quando não há o
// que comparar — aí o card simplesmente não desenha tendência.
function deltaLabel(delta: number | null | undefined, suffix: string) {
  if (delta === null || delta === undefined || delta === 0) return undefined
  return `${delta > 0 ? "+" : ""}${delta}${suffix}`
}

function deltaDirection(delta: number | null | undefined) {
  if (delta === null || delta === undefined || delta === 0) return undefined
  return delta > 0 ? "up" : "down"
}

export function AdminKpiCards() {
  const { data, isPending } = useAdminDashboard()

  if (isPending) return <MetricsSkeleton count={4} />

  const studentsDelta = data?.trends?.studentsDelta
  const attendancePp = data?.trends?.attendancePp

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="Total de alunos"
        value={String(data?.totalStudents ?? 0)}
        description="educandos cadastrados"
        trend={deltaDirection(studentsDelta)}
        trendLabel={deltaLabel(studentsDelta, " no mes")}
        icon={<Users className="h-5 w-5" />}
      />
      <MetricCard
        title="Turmas ativas"
        value={String(data?.totalClasses ?? 0)}
        description="acoes presenciais em curso"
        icon={<School className="h-5 w-5" />}
      />
      <MetricCard
        title="Presenca media"
        value={`${data?.averageAttendance ?? 0}%`}
        // Sem filtro de periodo na chamada, este numero e desde o inicio.
        // A descricao acompanha o calculo, em vez de prometer 30 dias.
        description="desde o inicio"
        trend={deltaDirection(attendancePp)}
        trendLabel={deltaLabel(attendancePp, "pp no mes")}
        icon={<TrendingUp className="h-5 w-5" />}
      />
      <MetricCard
        title="Alunos em risco"
        value={String(data?.studentsAtRisk ?? 0)}
        description="requerem acompanhamento"
        // Sem tendencia: e uma contagem do estado atual (alertas OPEN agora) e
        // o schema nao guarda snapshot historico para comparar.
        icon={<AlertTriangle className="h-5 w-5" />}
      />
    </div>
  )
}
