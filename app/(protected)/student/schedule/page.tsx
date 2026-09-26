import { PageHeader } from "@/components/platform/layout/page-header"
import { ScheduleList } from "./_components/schedule-list"

export default function StudentSchedulePage() {
  return (
    <>
      <PageHeader title="Agenda" description="Consulte suas próximas aulas, horários e locais." />
      <ScheduleList />
    </>
  )
}
