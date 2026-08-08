import { PageHeader } from "@/components/platform/layout/page-header"
import { ProgressPanel } from "./_components/progress-panel"

export default function StudentProgressPage() {
  return (
    <>
      <PageHeader title="Progresso" description="Veja seu desempenho, frequência e evolução nas aulas." />
      <ProgressPanel />
    </>
  )
}
