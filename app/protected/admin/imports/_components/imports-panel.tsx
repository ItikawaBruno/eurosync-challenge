import { FileSpreadsheet, PlugZap, UploadCloud } from "lucide-react"
import { Button } from "@/components/platform/ui/button"
import { SectionCard } from "@/components/platform/ui/card"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { CardSkeleton } from "@/components/platform/ui/loading"
import { useIntegrations } from "@/hooks/use-integrations"
import { toastInfo } from "@/lib/toast"

export function ImportsPanel() {
  const { data: integrations, isPending } = useIntegrations()

  const handleUpload = () => {
    toastInfo("Upload em desenvolvimento", "A importacao de planilhas sera disponibilizada em breve.")
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard title="Importar planilha" description="Envie CSV/XLSX estruturado para matriculas, turmas ou presencas.">
        <div className="rounded-2xl border border-dashed bg-slate-50 p-8 text-center">
          <UploadCloud className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-lg font-semibold">Arraste o arquivo ou selecione manualmente</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">A validacao de colunas e processamento serao executados automaticamente.</p>
          <Button className="mt-5" onClick={handleUpload}><FileSpreadsheet className="h-4 w-4" />Selecionar planilha</Button>
        </div>
      </SectionCard>
      <SectionCard title="Integracoes configuradas" description="Conectores ativos com sistemas externos.">
        {isPending ? <CardSkeleton /> : (
          <div className="grid gap-3">
            {(integrations ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma integracao configurada.</p>
            )}
            {(integrations ?? []).map((integration) => (
              <div className="rounded-xl border p-4" key={integration.id}>
                <PlugZap className="h-5 w-5 text-primary" />
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{integration.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{integration.provider} · {integration.baseUrl ?? "Sem URL"}</p>
                  </div>
                  <StatusBadge label={integration.status === "ACTIVE" ? "Ativo" : "Inativo"} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
