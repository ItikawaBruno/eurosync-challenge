"use client"

import { AlertTriangle, CalendarDays, ClipboardCheck, School } from "lucide-react"
import { MetricCard } from "@/components/platform/ui/metric-card"
import { SectionCard } from "@/components/platform/ui/card"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { PageSpinner, CardSkeleton } from "@/components/platform/ui/loading"
import { AttendanceLineChart, EngagementBarChart } from "@/components/platform/charts/platform-charts"
import { useProfessorDashboard } from "@/hooks/use-dashboard"
import { useAlerts } from "@/hooks/use-alerts"
import { useLessons } from "@/hooks/use-lessons"

export function ProfessorDashboardContent() {
  const { data: dashboard, isPending: dashLoading } = useProfessorDashboard()
  const { data: alerts, isPending: alertsLoading } = useAlerts()
  const { data: lessons, isPending: lessonsLoading } = useLessons()

  if (dashLoading) return <PageSpinner />

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Minhas turmas" value={String(Array.isArray((dashboard as any)?.myClasses) ? (dashboard as any).myClasses.length : (dashboard as any)?.myClasses ?? 0)} description="sob sua responsabilidade" icon={<School className="h-5 w-5" />} />
        <MetricCard title="Presenca media" value={`${dashboard?.attendanceAverage ?? 0}%`} description="turmas acompanhadas" icon={<ClipboardCheck className="h-5 w-5" />} />
        <MetricCard title="Proximas aulas" value={String((lessons ?? []).length)} description="nos proximos 7 dias" icon={<CalendarDays className="h-5 w-5" />} />
        <MetricCard title="Alunos em atencao" value={String(Array.isArray((dashboard as any)?.studentsAtRisk) ? (dashboard as any).studentsAtRisk.length : (dashboard as any)?.studentsAtRisk ?? 0)} description="priorizar contato" icon={<AlertTriangle className="h-5 w-5" />} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <SectionCard title="Presenca media das turmas" description="Evolucao recente da rotina presencial." contentClassName="h-[300px]">
          <AttendanceLineChart data={(dashboard as any)?.monthlyAttendance ?? []} />
        </SectionCard>
        <SectionCard title="Engajamento da turma" description="Indicadores operacionais para acompanhamento." contentClassName="h-[300px]">
          <EngagementBarChart data={[{ label: "SP-01", value: 86 }, { label: "CN-03", value: 74 }, { label: "Atividades", value: 81 }]} />
        </SectionCard>
        <SectionCard title="Proximas aulas" description="Agenda operacional do professor.">
          {lessonsLoading ? <CardSkeleton /> : (
            <div className="grid gap-3">
              {(lessons ?? []).slice(0, 5).map((lesson) => (
                <div className="rounded-xl border p-4" key={lesson.id}>
                  <p className="font-medium text-gray-800">{lesson.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(lesson.startsAt).toLocaleDateString("pt-BR")} · {(lesson as any).locationName ?? ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
        <SectionCard title="Alertas pedagogicos" description="Prioridades de acompanhamento.">
          {alertsLoading ? <CardSkeleton /> : (
            <div className="grid gap-3">
              {(alerts ?? []).slice(0, 5).map((alert) => (
                <div className="rounded-xl border p-4" key={alert.id}>
                  <div className="flex justify-between gap-3">
                    <p className="font-medium text-gray-800">{alert.type}</p>
                    <StatusBadge label={alert.severity === "HIGH" ? "Em risco" : "Normal"} />
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{alert.message}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}


