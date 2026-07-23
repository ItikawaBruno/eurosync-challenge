import { PageHeader } from "@/components/platform/layout/page-header"
import { useUser } from "@/hooks/use-user"
import { StudentProfileContent } from "./_components/student-profile-content"

export default function ProfessorStudentPage({ params }: { params: { id: string } }) {
  const { data: student } = useUser(params.id)

  return (
    <>
      <PageHeader title={student?.name ?? "Aluno"} description="Perfil do aluno com frequencia, progresso, engajamento digital, historico e observacoes pedagogicas." />
      <StudentProfileContent studentId={params.id} />
    </>
  )
}
