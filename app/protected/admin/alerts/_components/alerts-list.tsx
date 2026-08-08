"use client"

import { useState, type MouseEvent } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/platform/ui/button"
import { Card, SectionCard } from "@/components/platform/ui/card"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { CardSkeleton } from "@/components/platform/ui/loading"
import { AppModal, useOverlayState } from "@/components/platform/ui/app-modal"
import { useAlerts, useUpdateAlert } from "@/hooks/use-alerts"

type Alert = {
  id: string
  status: "OPEN" | "RESOLVED" | "IGNORED"
  severity: "LOW" | "MEDIUM" | "HIGH"
  type: "LOW_ATTENDANCE" | "LOW_ENGAGEMENT" | "DROPPING_PROGRESS" | "ABSENCE_SEQUENCE"
  message: string
  student?: { name: string }
  class?: { name: string }
}

const severityStyles = {
  LOW: "border-blue-200 bg-blue-50",
  MEDIUM: "border-amber-200 bg-amber-50",
  HIGH: "border-rose-200 bg-rose-50",
}

const severityLabels = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
}

const typeLabels = {
  LOW_ATTENDANCE: "Frequência baixa",
  LOW_ENGAGEMENT: "Engajamento baixo",
  DROPPING_PROGRESS: "Desempenho em queda",
  ABSENCE_SEQUENCE: "Ausências sequenciais",
}

const statusLabels = {
  OPEN: "Aberto",
  RESOLVED: "Resolvido",
  IGNORED: "Ignorado",
}

export function AlertsList() {
  const { data: alerts, isPending } = useAlerts()
  const updateAlert = useUpdateAlert()
  const modal = useOverlayState()

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const handleOpenAlert = (alert: Alert) => {
    setSelectedAlert(alert)
    modal.open()
  }

  const handleResolve = (alert?: Alert) => {
    const target = alert ?? selectedAlert
    if (!target) return
    updateAlert.mutate(
      { id: target.id, status: "RESOLVED" },
      { onSuccess: () => { if (!alert) { setSelectedAlert(null); modal.close() } } },
    )
  }

  const handleIgnore = (alert?: Alert) => {
    const target = alert ?? selectedAlert
    if (!target) return
    updateAlert.mutate(
      { id: target.id, status: "IGNORED" },
      { onSuccess: () => { if (!alert) { setSelectedAlert(null); modal.close() } } },
    )
  }

  const openAlerts = ((alerts ?? []) as Alert[]).filter((a) => a.status === "OPEN")
  const resolvedAlerts = ((alerts ?? []) as Alert[]).filter((a) => a.status === "RESOLVED")
  const ignoredAlerts = ((alerts ?? []) as Alert[]).filter((a) => a.status === "IGNORED")

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <>
      {openAlerts.length === 0 ? (
        <Card className="flex min-h-64 flex-col items-center justify-center border-dashed p-6 text-center">
          <h2 className="font-semibold">Nenhum alerta aberto</h2>
          <p className="mt-1 text-sm text-slate-600">Todos os alunos estão em dia.</p>
        </Card>
      ) : (
        <SectionCard title={`Alertas abertos (${openAlerts.length})`} description="Acompanhe os casos que exigem atenção imediata.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {openAlerts.map((alert) => (
              <div
                key={alert.id}
                role="button"
                onClick={() => handleOpenAlert(alert)}
                className={`group cursor-pointer rounded-2xl border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${severityStyles[alert.severity as keyof typeof severityStyles]}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <AlertTriangle className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{alert.student?.name || "Aluno"}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{typeLabels[alert.type as keyof typeof typeLabels]}</p>
                    </div>
                  </div>
                  <StatusBadge label={severityLabels[alert.severity as keyof typeof severityLabels]} tone={alert.severity} />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600 line-clamp-3">{alert.message}</p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={(event: MouseEvent<HTMLButtonElement>) => {
                      event.stopPropagation()
                      handleIgnore(alert)
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Ignorar
                  </button>
                  <button
                    type="button"
                    onClick={(event: MouseEvent<HTMLButtonElement>) => {
                      event.stopPropagation()
                      handleResolve(alert)
                    }}
                    className="inline-flex items-center justify-center rounded-full bg-[#0057B8] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#004a9e]"
                  >
                    Marcar resolvido
                  </button>
                  <span className="ml-auto text-xs text-slate-500">{alert.class?.name ?? "Sem turma"}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {resolvedAlerts.length > 0 && (
        <SectionCard title={`Alertas resolvidos (${resolvedAlerts.length})`} description="Casos que já foram acompanhados.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resolvedAlerts.map((alert) => (
              <Card key={alert.id} className="border-slate-200 bg-slate-50 text-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm text-slate-900">{alert.student?.name || "Aluno"}</p>
                    <p className="text-xs mt-1 text-slate-500">{typeLabels[alert.type as keyof typeof typeLabels]}</p>
                  </div>
                  <StatusBadge label="Resolvido" tone="success" />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-3">{alert.message}</p>
              </Card>
            ))}
          </div>
        </SectionCard>
      )}

      {ignoredAlerts.length > 0 && (
        <SectionCard title={`Alertas ignorados (${ignoredAlerts.length})`} description="Alertas desconsiderados.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ignoredAlerts.map((alert) => (
              <Card key={alert.id} className="border-slate-200 bg-slate-50 text-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm text-slate-900">{alert.student?.name || "Aluno"}</p>
                    <p className="text-xs mt-1 text-slate-500">{typeLabels[alert.type as keyof typeof typeLabels]}</p>
                  </div>
                  <StatusBadge label="Ignorado" tone="default" />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-3">{alert.message}</p>
              </Card>
            ))}
          </div>
        </SectionCard>
      )}

      <AppModal
        state={modal}
        title="Detalhes do alerta"
        footer={
          <>
            <Button variant="outline" onClick={modal.close}>Fechar</Button>
            <Button variant="outline" onClick={() => handleIgnore()} disabled={updateAlert.isPending}>
              Ignorar
            </Button>
            <Button variant="primary" onClick={() => handleResolve()} disabled={updateAlert.isPending}>
              Marcar como resolvido
            </Button>
          </>
        }
      >
        {selectedAlert && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-600">Aluno</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{selectedAlert.student?.name || "Não identificado"}</p>
              {selectedAlert.class && <p className="mt-1 text-sm text-slate-500">Turma: {selectedAlert.class.name}</p>}
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tipo</p>
                <p className="mt-2 font-semibold text-slate-900">{typeLabels[selectedAlert.type as keyof typeof typeLabels]}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Severidade</p>
                <p className="mt-2 font-semibold text-slate-900">{severityLabels[selectedAlert.severity as keyof typeof severityLabels]}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
                <p className="mt-2 font-semibold text-slate-900">{statusLabels[selectedAlert.status as keyof typeof statusLabels]}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-700">Mensagem</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{selectedAlert.message}</p>
            </div>
          </div>
        )}
      </AppModal>
    </>
  )
}
