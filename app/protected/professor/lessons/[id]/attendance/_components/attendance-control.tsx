"use client"

import { useState } from "react"
import { Button } from "@/components/platform/ui/button"
import { SectionCard } from "@/components/platform/ui/card"
import { PageSpinner } from "@/components/platform/ui/loading"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { useAttendanceByLesson, useUpdateAttendance } from "@/hooks/use-attendance"
import { useLesson, useUpdateLesson } from "@/hooks/use-lessons"

const STATUS_OPTIONS = ["PENDING", "PRESENT", "ABSENT", "LATE", "JUSTIFIED"] as const

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando",
  PRESENT: "Presente",
  ABSENT: "Falta",
  LATE: "Atrasado",
  JUSTIFIED: "Justificada",
}

export function AttendanceControl({ lessonId }: { lessonId: string }) {
  const { data: attendance, isPending } = useAttendanceByLesson(lessonId)
  const { data: lesson } = useLesson(lessonId)
  const updateAttendance = useUpdateAttendance()
  const updateLesson = useUpdateLesson()
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null)

  if (isPending) return <PageSpinner />

  const handleStatusChange = (studentId: string, status: string) => {
    if (status === "PENDING") return
    setPendingStudentId(studentId)
    updateAttendance.mutate(
      { lessonId, studentId, status },
      { onSuccess: () => setPendingStudentId(null) },
    )
  }

  const records = attendance ?? []
  const confirmed = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length
  const isOpen = lesson?.status === "OPEN"

  return (
    <SectionCard
      title="Controle de Presença"
      description={`${confirmed} de ${records.length} alunos confirmados.`}
      action={
        isOpen ? (
          <Button
            variant="primary"
            disabled={updateLesson.isPending}
            onClick={() => updateLesson.mutate({ id: lessonId, status: "CLOSED" })}
          >
            Encerrar chamada
          </Button>
        ) : (
          <StatusBadge label="Chamada encerrada" tone="default" />
        )
      }
    >
      {lesson?.qrCodeToken && isOpen && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Código da chamada</p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-[0.3em] text-slate-900">{lesson.qrCodeToken}</p>
          <p className="mt-1 text-xs text-slate-500">Compartilhe com a turma para confirmação por QR Code.</p>
        </div>
      )}

      <div className="grid gap-3">
        {records.map((record) => (
          <div key={record.id} className="rounded-3xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{record.student.name}</p>
                {record.checkedInAt && (
                  <p className="text-xs text-slate-500">
                    Check-in às {new Date(record.checkedInAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    {record.checkinMethod === "QR_CODE" ? " por QR Code" : record.checkinMethod === "LOCATION" ? " por localização" : ""}
                  </p>
                )}
              </div>
              <select
                aria-label={`Status de presença de ${record.student.name}`}
                value={record.status}
                disabled={updateAttendance.isPending && pendingStudentId === record.student.id}
                onChange={(e) => handleStatusChange(record.student.id, e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status} disabled={status === "PENDING"}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {records.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum aluno matriculado nesta turma.</p>
        )}
      </div>
    </SectionCard>
  )
}
