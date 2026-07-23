import { PageHeader } from "@/components/platform/layout/page-header"
import { useClass } from "@/hooks/use-classes"
import { ClassDetailContent } from "./_components/class-detail-content"

export default function ProfessorClassDetailPage({ params }: { params: { id: string } }) {
  const { data: cls } = useClass(params.id)

  return (
    <>
      <PageHeader title={cls?.name ?? "Turma"} description="Detalhe da turma com indicadores, alunos, historico de aulas e alertas pedagogicos." />
      <ClassDetailContent classId={params.id} />
    </>
  )
}
