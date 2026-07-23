import { PageHeader } from "@/components/platform/layout/page-header"
import { ImportsPanel } from "./_components/imports-panel"

export default function AdminImportsPage() {
  return (
    <>
      <PageHeader title="Importacoes" description="Envie e monitore importacoes de dados, planilhas e registros." />
      <ImportsPanel />
    </>
  )
}
