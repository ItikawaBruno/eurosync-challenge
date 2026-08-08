"use client"

import { SectionCard } from "@/components/platform/ui/card"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { TableSkeleton } from "@/components/platform/ui/loading"
import { useLmsLogs } from "@/hooks/use-lms"

export function LmsSyncLogs() {
  const { data: logs, isPending } = useLmsLogs()

  return (
    <SectionCard title="Log de sincronizacao" description="Historico detalhado das operacoes realizadas.">
      {isPending ? (
        <TableSkeleton rows={4} />
      ) : !logs || logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum registro de sincronizacao disponivel. Execute uma sincronizacao para gerar logs.</p>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-semibold">Horario</th>
                <th className="px-4 py-2 font-semibold">Acao</th>
                <th className="px-4 py-2 font-semibold">Entidade</th>
                <th className="px-4 py-2 font-semibold">Registros</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Mensagem</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.slice(0, 30).map((log) => (
                <tr key={log.id} className="transition hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-2 text-muted-foreground">
                    {formatTime(log.timestamp)}
                  </td>
                  <td className="px-4 py-2 capitalize">{log.action.replace("_", " ")}</td>
                  <td className="px-4 py-2 capitalize">{log.entity}</td>
                  <td className="px-4 py-2">{log.recordsProcessed}</td>
                  <td className="px-4 py-2">
                    <StatusBadge
                      label={log.status === "success" ? "OK" : log.status === "warning" ? "Alerta" : "Erro"}
                      tone={log.status === "success" ? "success" : log.status === "warning" ? "warning" : "danger"}
                    />
                  </td>
                  <td className="max-w-xs truncate px-4 py-2 text-muted-foreground">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  )
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

