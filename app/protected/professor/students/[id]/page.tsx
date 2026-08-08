"use client"

import { use } from "react"
import { PageHeader } from "@/components/platform/layout/page-header"
import { useUser } from "@/hooks/use-user"
import { StudentProfileContent } from "./_components/student-profile-content"

export default function ProfessorStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: student } = useUser(id)

  return (
    <>
      <PageHeader title={student?.name ?? "Aluno"} description="Perfil do aluno com frequencia, progresso, engajamento digital, historico e observacoes pedagogicas." />
      <StudentProfileContent studentId={id} />
    </>
  )
}
