"use client"

import { useState } from "react"
import { Button } from "@/components/platform/ui/button"
import { Card } from "@/components/platform/ui/card"
import { SectionCard } from "@/components/platform/ui/card"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { PageSpinner, CardSkeleton } from "@/components/platform/ui/loading"
import { AppModal, useOverlayState } from "@/components/platform/ui/app-modal"
import { useAlerts, useUpdateAlert } from "@/hooks/use-alerts"

const severityColors = {
  LOW: "bg-blue-50 text-blue-800 border-blue-200",
  MEDIUM: "bg-amber-50 text-amber-800 border-amber-200",
  HIGH: "bg-red-50 text-red-800 border-red-200",
}

const typeLabels = {
  LOW_ATTENDANCE: "Frequencia Baixa",
  LOW_ENGAGEMENT: "Engajamento Baixo",
  DROPPING_PROGRESS: "Desempenho em Queda",
  ABSENCE_SEQUENCE: "Ausencias Sequenciais",
}

export function AlertsList() {
  const { data: alerts, isPending } = useAlerts()
  const updateAlert = useUpdateAlert()
  const modal = useOverlayState()

  const [selectedAlert, setSelectedAlert] = useState<any>(null)

  const handleOpenAlert = (alert: any) => {
    setSelectedAlert(alert)
    modal.open()
  }

  const handleResolve = () => {
    if (!selectedAlert) return
    updateAlert.mutate(
      { id: selectedAlert.id, status: "RESOLVED" },
      { onSuccess: () => { setSelectedAlert(null); modal.close() } },
    )
  }

  const handleIgnore = () => {
    if (!selectedAlert) return
    updateAlert.mutate(
      { id: selectedAlert.id, status: "IGNORED" },
      { onSuccess: () => { setSelectedAlert(null); modal.close() } },
    )
  }

  const openAlerts = (alerts ?? []).filter((a: any) => a.status === "OPEN")
  const resolvedAlerts = (alerts ?? []).filter((a: any) => a.status === "RESOLVED")

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
          <p className="mt-1 text-sm text-muted-foreground">Todos os seus alunos estão em dia!</p>
        </Card>
      ) : (
        <SectionCard title={`Alertas abertos (${openAlerts.length})`} description="Ações necessarias para acompanhar seus alunos">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {openAlerts.map((alert: any) => (
              <button
                key={alert.id}
                onClick={() => handleOpenAlert(alert)}
                className={`rounded-xl border p-4 text-left transition-colors hover:opacity-80 ${severityColors[alert.severity as keyof typeof severityColors]}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.student?.name || "Aluno"}</p>
                    <p className="text-xs mt-1 opacity-75">{typeLabels[alert.type as keyof typeof typeLabels]}</p>
                  </div>
                  <StatusBadge label={alert.severity} />
                </div>
                <p className="mt-2 text-xs">{alert.message}</p>
              </button>
            ))}
          </div>
        </SectionCard>
      )}

      {resolvedAlerts.length > 0 && (
        <SectionCard title={`Alertas resolvidos (${resolvedAlerts.length})`} description="Problemas ja acompanhados">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {resolvedAlerts.map((alert: any) => (
              <div
                key={alert.id}
                className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{alert.student?.name || "Aluno"}</p>
                    <p className="text-xs mt-1 opacity-75">{typeLabels[alert.type as keyof typeof typeLabels]}</p>
                  </div>
                  <StatusBadge label="RESOLVED" />
                </div>
              </div>
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
            <Button variant="outline" onClick={handleIgnore} disabled={updateAlert.isPending}>
              Ignorar
            </Button>
            <Button variant="accent" onClick={handleResolve} disabled={updateAlert.isPending}>
              Marcar como resolvido
            </Button>
          </>
        }
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium">Aluno</p>
              <p className="mt-1 text-base font-semibold">{selectedAlert.student?.name || "Nao identificado"}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Tipo</p>
                <p className="mt-1 font-medium">{typeLabels[selectedAlert.type as keyof typeof typeLabels]}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Severidade</p>
                <p className="mt-1 font-medium">{selectedAlert.severity}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Status</p>
                <p className="mt-1 font-medium">{selectedAlert.status}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Mensagem</p>
              <p className="mt-2 text-sm text-muted-foreground">{selectedAlert.message}</p>
            </div>
          </div>
        )}
      </AppModal>
    </>
  )
}
