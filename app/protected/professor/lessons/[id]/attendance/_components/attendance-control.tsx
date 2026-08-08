"use client"

import { Button } from "@/components/platform/ui/button"
import { SectionCard } from "@/components/platform/ui/card"
import { PageSpinner } from "@/components/platform/ui/loading"
import { useAttendanceByLesson } from "@/hooks/use-attendance"

export function AttendanceControl({ lessonId }: { lessonId: string }) {
  const { data: attendance, isPending } = useAttendanceByLesson()

  if (isPending) return <PageSpinner />

  return (
    <SectionCard title="Controle de Presença" description="Atualize e revise as presenças desta aula.">
      <div className="grid gap-3">
        {(attendance ?? []).map((record) => (
          <div key={record.id} className="rounded-3xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{record.student.name}</p>
              <span className="text-sm text-muted-foreground">{record.status}</span>
            </div>
          </div>
        ))}
        <Button variant="outline">Atualizar presenças</Button>
      </div>
    </SectionCard>
  )
}
