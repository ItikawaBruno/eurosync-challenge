"use client"

import { use } from "react"
import { PageHeader } from "@/components/platform/layout/page-header"
import { useClass } from "@/hooks/use-classes"
import { ClassDetailContent } from "@/components/platform/classes/class-detail-content"

export default function ProfessorClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: cls } = useClass(id)

  return (
    <>
      <PageHeader title={cls?.name ?? "Turma"} description="Detalhe da turma com indicadores, alunos, historico de aulas e alertas pedagogicos." />
      <ClassDetailContent classId={id} />
    </>
  )
}
