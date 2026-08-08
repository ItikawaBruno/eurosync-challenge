"use client"

import { BookOpen, CheckCircle2, TrendingUp } from "lucide-react"
import { MetricCard } from "@/components/platform/ui/metric-card"
import { SectionCard } from "@/components/platform/ui/card"
import { PageSpinner } from "@/components/platform/ui/loading"
import { useStudentDashboard } from "@/hooks/use-dashboard"

export function ProgressPanel() {
  const { data: dashboard, isPending } = useStudentDashboard()

  const attendanceRate = (dashboard as any)?.attendance?.rate ?? 0
  const presentCount = (dashboard as any)?.attendance?.present ?? 0
  const totalLessons = (dashboard as any)?.attendance?.total ?? 0

  if (isPending) return <PageSpinner />

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Frequencia" value={`${attendanceRate}%`} description="presenca atual" icon={<CheckCircle2 className="h-5 w-5" />} />
        <MetricCard title="Presencas" value={String(presentCount)} description="aulas presentes" icon={<TrendingUp className="h-5 w-5" />} />
        <MetricCard title="Total de aulas" value={String(totalLessons)} description="trilha presencial" icon={<BookOpen className="h-5 w-5" />} />
      </div>
      <SectionCard title="Score de frequencia" description="Indicadores individuais de presenca.">
        <div className="grid gap-3 md:grid-cols-3">
          <Score label="Frequencia" value={`${attendanceRate}%`} />
          <Score label="Presencas" value={String(presentCount)} />
          <Score label="Total de aulas" value={String(totalLessons)} />
        </div>
      </SectionCard>
    </div>
  )
}

function Score({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border bg-slate-50 p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>
}


