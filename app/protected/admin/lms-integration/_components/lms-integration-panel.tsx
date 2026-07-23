"use client"

import { useState } from "react"
import { Spinner } from "@heroui/react"
import { Button } from "@/components/platform/ui/button"
import { RefreshCw, RotateCcw } from "lucide-react"
import { useLmsOverview, useLmsSyncAll, useLmsReset } from "@/hooks/use-lms"
import { MetricsSkeleton } from "@/components/platform/ui/loading"
import { LmsSyncCards } from "./lms-sync-cards"
import { LmsSyncTable } from "./lms-sync-table"
import { LmsSyncLogs } from "./lms-sync-logs"
import { LmsDataModal } from "./lms-data-modal"
import type { LmsSyncEntity } from "@/hooks/use-lms"

export function LmsIntegrationPanel() {
  const { data: overview, isPending } = useLmsOverview()
  const syncAll = useLmsSyncAll()
  const reset = useLmsReset()
  const [selectedEntity, setSelectedEntity] = useState<LmsSyncEntity | null>(null)

  if (isPending) {
    return (
      <div className="mt-6 space-y-6">
        <MetricsSkeleton count={4} />
        <MetricsSkeleton count={3} />
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          onClick={() => syncAll.mutate()}
          disabled={syncAll.isPending}
        >
          {syncAll.isPending ? <Spinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
          {syncAll.isPending ? "Sincronizando..." : "Sincronizar tudo"}
        </Button>
        <Button
          variant="outline"
          onClick={() => reset.mutate()}
          disabled={reset.isPending}
        >
          <RotateCcw className="h-4 w-4" />
          Resetar estado
        </Button>
      </div>

      {overview && <LmsSyncCards overview={overview} />}
      {overview && <LmsSyncTable overview={overview} onViewData={setSelectedEntity} />}
      <LmsSyncLogs />
      <LmsDataModal entity={selectedEntity} onClose={() => setSelectedEntity(null)} />
    </div>
  )
}
