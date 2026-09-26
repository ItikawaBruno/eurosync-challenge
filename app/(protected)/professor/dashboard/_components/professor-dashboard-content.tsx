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

const UPCOMING_WINDOW_DAYS = 7

export function ProfessorDashboardContent() {
  const { data: dashboard, isPending: dashLoading } = useProfessorDashboard()
  const { data: alerts, isPending: alertsLoading } = useAlerts()
  const { data: lessons, isPending: lessonsLoading } = useLessons(undefined, { upcoming: true, days: UPCOMING_WINDOW_DAYS })

  if (dashLoading) return <PageSpinner />

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Minhas turmas" value={String((dashboard?.myClasses ?? []).length)} description="sob sua responsabilidade" icon={<School className="h-5 w-5" />} />
        <MetricCard title="Presenca media" value={`${dashboard?.attendanceAverage ?? 0}%`} description="turmas acompanhadas" icon={<ClipboardCheck className="h-5 w-5" />} />
        <MetricCard title="Proximas aulas" value={String((lessons ?? []).length)} description={`nos proximos ${UPCOMING_WINDOW_DAYS} dias`} icon={<CalendarDays className="h-5 w-5" />} />
        <MetricCard title="Alunos em atencao" value={String((dashboard?.studentsAtRisk ?? []).length)} description="priorizar contato" icon={<AlertTriangle className="h-5 w-5" />} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <SectionCard title="Presenca media das turmas" description="Evolucao recente da rotina presencial." contentClassName="h-[300px]">
          <AttendanceLineChart data={dashboard?.monthlyAttendance ?? []} />
        </SectionCard>
        <SectionCard title="Engajamento por turma" description="Entregas de tarefas sobre o total esperado." contentClassName="h-[300px]">
          <EngagementBarChart data={dashboard?.engagementByClass ?? []} />
        </SectionCard>
        <SectionCard title="Proximas aulas" description="Agenda operacional do professor.">
          {lessonsLoading ? <CardSkeleton /> : (
            <div className="grid gap-3">
              {(lessons ?? []).slice(0, 5).map((lesson) => (
                <div className="rounded-xl border p-4" key={lesson.id}>
                  <p className="font-medium text-gray-800">{lesson.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(lesson.startsAt).toLocaleDateString("pt-BR")} · {lesson.locationName ?? ""}
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


