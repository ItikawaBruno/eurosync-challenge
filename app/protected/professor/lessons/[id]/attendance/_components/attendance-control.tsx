"use client"

import { useState } from "react"
import { Button } from "@/components/platform/ui/button"
import { SectionCard } from "@/components/platform/ui/card"
import { PageSpinner } from "@/components/platform/ui/loading"
import { useAttendanceByLesson, useUpdateAttendance } from "@/hooks/use-attendance"

const STATUS_OPTIONS = ["PRESENT", "ABSENT", "LATE", "JUSTIFIED"] as const

export function AttendanceControl({ lessonId }: { lessonId: string }) {
  const { data: attendance, isPending } = useAttendanceByLesson(lessonId)
  const updateAttendance = useUpdateAttendance()
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null)

  if (isPending) return <PageSpinner />

  const handleStatusChange = (studentId: string, status: string) => {
    setPendingStudentId(studentId)
    updateAttendance.mutate(
      { lessonId, studentId, status },
      { onSuccess: () => setPendingStudentId(null) },
    )
  }

  return (
    <SectionCard title="Controle de Presença" description="Atualize e revise as presenças desta aula.">
      <div className="grid gap-3">
        {(attendance ?? []).map((record) => (
          <div key={record.id} className="rounded-3xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{record.student.name}</p>
              <select
                aria-label={`Status de presença de ${record.student.name}`}
                value={record.status}
                disabled={updateAttendance.isPending && pendingStudentId === record.student.id}
                onChange={(e) => handleStatusChange(record.student.id, e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {!(attendance ?? []).length && (
          <p className="text-sm text-muted-foreground">Nenhum aluno registrado para esta aula.</p>
        )}
      </div>
    </SectionCard>
  )
}
