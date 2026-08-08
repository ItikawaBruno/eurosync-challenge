"use client"

import { CalendarDays, PlugZap } from "lucide-react"
import { AttendanceLineChart, EngagementBarChart } from "@/components/platform/charts/platform-charts"
import { SectionCard } from "@/components/platform/ui/card"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { PageSpinner, CardSkeleton } from "@/components/platform/ui/loading"
import { useAdminDashboard } from "@/hooks/use-dashboard"
import { useAlerts, useUpdateAlert } from "@/hooks/use-alerts"
import { useClasses } from "@/hooks/use-classes"

export function AdminDashboardSections() {
  const { data: dashboard, isPending: dashLoading } = useAdminDashboard()
  const { data: alerts, isPending: alertsLoading } = useAlerts()
  const { data: classes, isPending: classesLoading } = useClasses()
  const updateAlert = useUpdateAlert()

  if (dashLoading) return <PageSpinner />

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
      <SectionCard title="Frequencia por mes" description="Evolucao consolidada das acoes presenciais." contentClassName="h-[320px]">
        <AttendanceLineChart data={dashboard?.monthlyAttendance ?? []} />
      </SectionCard>
      <SectionCard title="Engajamento por frente" description="Indicadores digitais." contentClassName="h-[320px]">
        <EngagementBarChart data={[{ label: "Moodle", value: 78 }, { label: "Aulas", value: 86 }, { label: "Avisos", value: 72 }, { label: "Atividades", value: 81 }]} />
      </SectionCard>
      <SectionCard title="Alertas recentes" description="Sinais que pedem acao da equipe pedagogica.">
        {alertsLoading ? <CardSkeleton /> : (
          <div className="grid gap-3">
            {(alerts ?? []).slice(0, 5).map((alert) => (
              <div className="rounded-xl border bg-slate-50 p-4" key={alert.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{alert.message}</p>
                  <div className="flex items-center gap-2">
                    <StatusBadge label={alert.status === "OPEN" ? "Aberto" : alert.status === "RESOLVED" ? "Resolvido" : "Ignorado"} tone={alert.status === "OPEN" ? "warning" : "success"} />
                    {alert.status === "OPEN" && (
                      <button
                        className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-100"
                        onClick={() => updateAlert.mutate({ id: alert.id, status: "RESOLVED" })}
                      >
                        Resolver
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{alert.type} · Severidade: {alert.severity}</p>
              </div>
            ))}
            {!alerts?.length && <p className="text-sm text-muted-foreground">Nenhum alerta no momento.</p>}
          </div>
        )}
      </SectionCard>
      <div className="grid gap-6">
        <SectionCard title="Proximas acoes presenciais" description="Agenda executiva das turmas.">
          {classesLoading ? <CardSkeleton /> : (
            <div className="grid gap-3">
              {(classes ?? []).slice(0, 4).map((cls) => (
                <div className="flex gap-3 rounded-xl border p-4" key={cls.id}>
                  <CalendarDays className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{cls.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {cls.status} · {(cls as any)._count?.lessons ?? 0} aulas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
        <SectionCard title="Resumo do sistema" description="Indicadores globais da plataforma.">
          <div className="grid gap-3">
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div className="flex gap-3"><PlugZap className="mt-0.5 h-5 w-5 text-primary" /><div><p className="font-medium">Total de aulas</p></div></div>
              <StatusBadge label={String(dashboard?.totalLessons ?? 0)} />
            </div>
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div className="flex gap-3"><PlugZap className="mt-0.5 h-5 w-5 text-primary" /><div><p className="font-medium">Alertas abertos</p></div></div>
              <StatusBadge label={String(dashboard?.openAlerts ?? 0)} tone="warning" />
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}


