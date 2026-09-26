"use client"

import { use } from "react"
import { PageHeader } from "@/components/platform/layout/page-header"
import { useClass } from "@/hooks/use-classes"
import { StudentClassDetail } from "./_components/student-class-detail"

export default function StudentClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: cls } = useClass(id)

  return (
    <>
      <PageHeader title={cls?.name ?? "Turma"} description="Tarefas deste grupo e seu desempenho." />
      <StudentClassDetail classId={id} />
    </>
  )
}
