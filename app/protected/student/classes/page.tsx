import { PageHeader } from "@/components/platform/layout/page-header"
import { StudentClassesList } from "./_components/student-classes-list"

export default function StudentClassesPage() {
  return (
    <>
      <PageHeader title="Minhas turmas" description="Grupos que voce participa e as tarefas pendentes." />
      <StudentClassesList />
    </>
  )
}
