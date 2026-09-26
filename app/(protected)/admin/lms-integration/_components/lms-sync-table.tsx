import { Button } from "@/components/platform/ui/button"
import { RefreshCw, Eye } from "lucide-react"
import { SectionCard } from "@/components/platform/ui/card"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { useLmsSyncEntity, type LmsSyncEntity } from "@/hooks/use-lms"

interface SyncEntityState {
  count: number
  lastSync: string | null
  status: string
}

interface LmsSyncOverview {
  courses: SyncEntityState
  classes: SyncEntityState
  students: SyncEntityState
  professors: SyncEntityState
  enrollments: SyncEntityState
  progress: SyncEntityState
  attendance: SyncEntityState
  activities: SyncEntityState
  grades: SyncEntityState
  completions: SyncEntityState
}

const entityLabels: Record<LmsSyncEntity, string> = {
  courses: "Cursos",
  classes: "Turmas",
  students: "Educandos",
  professors: "Professores",
  enrollments: "Matriculas",
  progress: "Progresso",
  attendance: "Frequencia",
  activities: "Atividades",
  grades: "Notas",
  completions: "Conclusoes",
}

function statusLabel(status: string): string {
  switch (status) {
    case "success": return "Sincronizado"
    case "syncing": return "Processando"
    case "error": return "Erro"
    default: return "Pendente"
  }
}

export function LmsSyncTable({
  overview,
  onViewData,
}: {
  overview: LmsSyncOverview
  onViewData: (entity: LmsSyncEntity) => void
}) {
  const syncEntity = useLmsSyncEntity()

  const entities = Object.entries(overview) as [LmsSyncEntity, SyncEntityState][]

  return (
    <SectionCard title="Entidades de sincronizacao" description="Controle individual de cada tipo de dado importado do Moodle.">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Entidade</th>
              <th className="px-4 py-3 font-semibold">Registros</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Ultima sincronizacao</th>
              <th className="px-4 py-3 font-semibold text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {entities.map(([entity, state]) => (
              <tr key={entity} className="transition hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-gray-500">{entityLabels[entity]}</td>
                <td className="px-4 py-3 text-gray-500">{state.count}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={statusLabel(state.status)} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {state.lastSync ? formatDate(state.lastSync) : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewData(entity)}
                      disabled={state.count === 0}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver dados
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => syncEntity.mutate(entity)}
                      disabled={syncEntity.isPending}
                    >
                      {syncEntity.isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      Sincronizar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
