"use client"

import { Card } from "@/components/platform/ui/card"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { useClass } from "@/hooks/use-classes"

export function ClassDetailContent({ classId }: { classId: string }) {
  const { data: cls } = useClass(classId)

  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{cls?.name ?? "Detalhes da turma"}</h2>
            {cls?.description && <p className="mt-2 text-sm text-muted-foreground">{cls.description}</p>}
          </div>
          <StatusBadge label={cls?.status ?? "Ativo"} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border p-4">
            <p className="text-sm text-muted-foreground">Alunos</p>
            <p className="mt-2 text-xl font-semibold">{(cls as any)._count?.students ?? 0}</p>
          </div>
          <div className="rounded-3xl border p-4">
            <p className="text-sm text-muted-foreground">Aulas</p>
            <p className="mt-2 text-xl font-semibold">{(cls as any)._count?.lessons ?? 0}</p>
          </div>
          <div className="rounded-3xl border p-4">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="mt-2 text-xl font-semibold">{cls?.status ?? "Ativo"}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
