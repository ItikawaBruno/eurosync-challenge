"use client"

import { Bell } from "lucide-react"
import { useState } from "react"
import { SectionCard } from "@/components/platform/ui/card"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { CardSkeleton } from "@/components/platform/ui/loading"
import { AppModal, useOverlayState } from "@/components/platform/ui/app-modal"
import { Button } from "@/components/platform/ui/button"
import { useAlerts, useUpdateAlert } from "@/hooks/use-alerts"

export function NotificationsList() {
  const { data: alerts, isPending } = useAlerts()
  const updateAlert = useUpdateAlert()
  const modal = useOverlayState()
  const [selected, setSelected] = useState<{ id: string; message: string } | null>(null)

  const openAlert = (a: { id: string; message: string }) => { setSelected(a); modal.open() }
  const handleResolve = () => { if (!selected) return; updateAlert.mutate({ id: selected.id, status: "RESOLVED" }, { onSuccess: modal.close }) }

  return (
    <>
      <SectionCard title="Avisos" description="Lembretes, mudancas de horario, faltas registradas e alertas de participacao.">
        <div className="grid gap-3">
          {isPending && <CardSkeleton />}
          {(alerts ?? []).map((alert) => (
            <div
              className="flex cursor-pointer flex-col gap-3 rounded-xl border p-4 hover:bg-slate-50 md:flex-row md:items-start md:justify-between"
              key={alert.id}
              onClick={() => openAlert(alert)}
            >
              <div className="flex gap-3">
                <div className="rounded-xl bg-secondary p-2 text-primary"><Bell className="h-5 w-5" /></div>
                <div>
                  <h2 className="font-semibold text-[#0f172b]">{alert.type}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{alert.message}</p>
                </div>
              </div>
              <StatusBadge label={alert.status === "OPEN" ? "Pendente" : "Resolvido"} tone={alert.status === "OPEN" ? "warning" : "success"} />
            </div>
          ))}
          {!isPending && !(alerts ?? []).length && (
            <p className="py-4 text-center text-sm text-muted-foreground">Nenhum aviso no momento.</p>
          )}
        </div>
      </SectionCard>

      <AppModal
        state={modal}
        title="Aviso"
        footer={
          <>
            <Button variant="outline" onClick={modal.close}>Fechar</Button>
            <Button variant="accent" onClick={handleResolve} disabled={updateAlert.isPending}>Marcar como lido</Button>
          </>
        }
      >
        <p className="text-sm leading-6 text-muted-foreground">{selected?.message}</p>
      </AppModal>
    </>
  )
}

