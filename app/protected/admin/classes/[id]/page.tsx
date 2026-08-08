"use client"

import { use } from "react"
import { PageHeader } from "@/components/platform/layout/page-header"
import { useClass } from "@/hooks/use-classes"
import { ClassDetailContent } from "@/components/platform/classes/class-detail-content"

export default function AdminClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: cls } = useClass(id)

  return (
    <>
      <PageHeader title={cls?.name ?? "Turma"} description="Detalhe do grupo com professor, alunos, tarefas e adesao." />
      <ClassDetailContent classId={id} />
    </>
  )
}
