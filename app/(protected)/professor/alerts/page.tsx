import { PageHeader } from "@/components/platform/layout/page-header"
import { GenerateAlertsButton } from "@/components/platform/alerts/generate-alerts-button"
import { AlertsList } from "./_components/alerts-list"

export default function ProfessorAlertsPage() {
  return (
    <>
      <PageHeader
        title="Alertas do Professor"
        description="Monitore os avisos pedagógicos da sua turma."
        action={<GenerateAlertsButton />}
      />
      <AlertsList />
    </>
  )
}
