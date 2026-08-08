"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card } from "@/components/platform/ui/card"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { CardSkeleton } from "@/components/platform/ui/loading"
import { useClasses } from "@/hooks/use-classes"

export function StudentClassesList() {
  const { data: classes, isPending } = useClasses()

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {(classes ?? []).map((cls) => (
        <Card className="p-5" key={cls.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{cls.name}</h2>
              {cls.description && <p className="mt-1 text-sm text-muted-foreground">{cls.description}</p>}
            </div>
            <StatusBadge label={cls.status} />
          </div>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Professor</dt><dd className="font-medium">{cls.teacher?.name ?? "-"}</dd></div>
          </dl>
          <Link href={`/protected/student/classes/${cls.id}`} className="mt-5 flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">Ver tarefas<ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Card>
      ))}
      {!classes?.length && (
        <Card className="flex min-h-40 flex-col items-center justify-center p-6 text-center md:col-span-2 xl:col-span-3">
          <p className="text-sm text-muted-foreground">Voce ainda nao esta matriculado em nenhuma turma.</p>
        </Card>
      )}
    </div>
  )
}
