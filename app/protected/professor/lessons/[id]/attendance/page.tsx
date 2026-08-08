"use client"

import { use } from "react"
import { PageHeader } from "@/components/platform/layout/page-header"
import { useLesson } from "@/hooks/use-lessons"
import { AttendanceControl } from "./_components/attendance-control"

export default function ProfessorAttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: lesson } = useLesson(id)

  return (
    <>
      <PageHeader title="Controle de presenca" description={`${lesson?.title ?? "Aula"}. Gerencie chamada, QR Code, localizacao e ajustes manuais.`} />
      <AttendanceControl lessonId={id} />
    </>
  )
}
