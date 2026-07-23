import { PageHeader } from "@/components/platform/layout/page-header"
import { useLesson } from "@/hooks/use-lessons"
import { AttendanceControl } from "./_components/attendance-control"

export default function ProfessorAttendancePage({ params }: { params: { id: string } }) {
  const { data: lesson } = useLesson(params.id)

  return (
    <>
      <PageHeader title="Controle de presenca" description={`${lesson?.title ?? "Aula"}. Gerencie chamada, QR Code, localizacao e ajustes manuais.`} />
      <AttendanceControl lessonId={params.id} />
    </>
  )
}
