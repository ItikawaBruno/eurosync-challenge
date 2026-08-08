"use client"

import Link from "next/link"
import { Bell, CalendarDays, CheckCircle2, TrendingUp } from "lucide-react"
import { MetricCard } from "@/components/platform/ui/metric-card"
import { SectionCard } from "@/components/platform/ui/card"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { PageSpinner, CardSkeleton } from "@/components/platform/ui/loading"
import { useStudentDashboard } from "@/hooks/use-dashboard"
import { useAlerts } from "@/hooks/use-alerts"

export function StudentDashboardContent() {
  const { data: dashboard, isPending: dashLoading } = useStudentDashboard()
  const { data: alerts, isPending: alertsLoading } = useAlerts()

  if (dashLoading) return <PageSpinner />

  const nextLesson = (dashboard as any)?.nextLesson
  const attendanceRate = (dashboard as any)?.attendance?.rate ?? 0
  const presentCount = (dashboard as any)?.attendance?.present ?? 0

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Proxima aula" value={nextLesson ? new Date(nextLesson.startsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "--"} description={nextLesson ? new Date(nextLesson.startsAt).toLocaleDateString("pt-BR") : "Nenhuma aula"} icon={<CalendarDays className="h-5 w-5" />} />
        <MetricCard title="Frequencia atual" value={`${attendanceRate}%`} description="presenca acumulada" icon={<CheckCircle2 className="h-5 w-5" />} />
        <MetricCard title="Presencas" value={String(presentCount)} description="aulas presentes" icon={<TrendingUp className="h-5 w-5" />} />
        <MetricCard title="Alertas" value={String((alerts ?? []).filter((a) => a.status === "OPEN").length)} description="avisos abertos" icon={<Bell className="h-5 w-5" />} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="Proxima aula" description={nextLesson ? nextLesson.title : "Sem aulas agendadas"} action={<Link href="/student/check-in" className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">Confirmar presenca</Link>}>
          <div className="rounded-xl border bg-blue-50 p-4 text-sm leading-6 text-blue-800">A chamada abrira no horario da aula. Tenha o QR Code ou a localizacao ativa para confirmar sua presenca.</div>
        </SectionCard>
        <SectionCard title="Avisos importantes" description="Comunicados recentes para sua turma.">
          {alertsLoading ? <CardSkeleton /> : (
            <div className="grid gap-3">
              {(alerts ?? []).slice(0, 5).map((alert) => (
                <div className="rounded-xl border p-4" key={alert.id}>
                  <div className="flex justify-between gap-3">
                    <p className="font-medium">{alert.type}</p>
                    <StatusBadge label={alert.status === "OPEN" ? "Pendente" : "Resolvido"} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}


