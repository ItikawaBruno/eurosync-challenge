"use client"

import { Card } from "@/components/platform/ui/card"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { useUser } from "@/hooks/use-user"

export function StudentProfileContent({ studentId }: { studentId: string }) {
  const { data: student } = useUser(studentId)

  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{student?.name ?? "Perfil do Aluno"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{student?.email}</p>
          </div>
          <StatusBadge label={student?.role ?? "Aluno"} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border p-4">
            <p className="text-sm text-muted-foreground">Matrícula</p>
            <p className="mt-2 text-xl font-semibold">{student?.id}</p>
          </div>
          <div className="rounded-3xl border p-4">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="mt-2 text-xl font-semibold">{student?.email}</p>
          </div>
          <div className="rounded-3xl border p-4">
            <p className="text-sm text-muted-foreground">Perfil</p>
            <p className="mt-2 text-xl font-semibold">{student?.role}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
