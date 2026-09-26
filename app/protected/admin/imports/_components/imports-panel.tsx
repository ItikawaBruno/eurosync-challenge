"use client"

import { useRef, useState } from "react"
import { FileSpreadsheet, PlugZap, UploadCloud } from "lucide-react"
import { Button } from "@/components/platform/ui/button"
import { SectionCard } from "@/components/platform/ui/card"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { CardSkeleton } from "@/components/platform/ui/loading"
import { useIntegrations } from "@/hooks/use-integrations"
import { useImportUsers, type ImportRow, type ImportResult } from "@/hooks/use-user-import"
import { parseUserCsv } from "@/lib/csv"
import { toastInfo } from "@/lib/toast"

export function ImportsPanel() {
  const { data: integrations, isPending } = useIntegrations()
  const importUsers = useImportUsers()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fileName, setFileName] = useState<string | null>(null)
  const [rows, setRows] = useState<ImportRow[]>([])
  const [results, setResults] = useState<ImportResult[] | null>(null)

  const handleSelectFile = () => fileInputRef.current?.click()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setResults(null)
    setFileName(file.name)

    try {
      const text = await file.text()
      const parsed = parseUserCsv(text)
      setRows(parsed)
    } catch (error) {
      setRows([])
      toastInfo("Erro ao ler CSV", error instanceof Error ? error.message : "Formato invalido")
    } finally {
      event.target.value = ""
    }
  }

  const handleImport = () => {
    if (rows.length === 0) return
    importUsers.mutate(rows, {
      onSuccess: (data) => {
        setResults(data.results)
        setRows([])
        setFileName(null)
      },
    })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard title="Importar usuarios" description="Envie um CSV com colunas name, email, role (admin, professor, student ou parent). As contas ja sao criadas no Clerk, sem precisar de cadastro.">
        <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
        <div className="rounded-2xl border border-dashed bg-slate-50 p-8 text-center">
          <UploadCloud className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-lg font-semibold text-gray-600">Selecione o arquivo CSV</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Colunas esperadas: name, email, role.</p>
          <Button className="mt-5" onClick={handleSelectFile}><FileSpreadsheet className="h-4 w-4" />Selecionar planilha</Button>
        </div>

        {fileName && rows.length > 0 && (
          <div className="mt-5 rounded-xl border p-4">
            <p className="text-sm font-medium">{fileName} — {rows.length} linha(s) detectada(s)</p>
            <div className="mt-3 max-h-48 overflow-y-auto text-sm">
              {rows.slice(0, 10).map((row, i) => (
                <div key={i} className="flex justify-between border-b py-1 text-muted-foreground last:border-0">
                  <span>{row.name}</span>
                  <span>{row.email}</span>
                  <span>{row.role}</span>
                </div>
              ))}
              {rows.length > 10 && <p className="mt-2 text-xs text-muted-foreground">+ {rows.length - 10} linha(s)</p>}
            </div>
            <Button className="mt-4" variant="accent" onClick={handleImport} disabled={importUsers.isPending}>
              {importUsers.isPending ? "Importando..." : `Importar ${rows.length} usuario(s)`}
            </Button>
          </div>
        )}

        {results && (
          <div className="mt-5 rounded-xl border p-4">
            <p className="text-sm font-medium">Resultado da importacao</p>
            <div className="mt-3 grid gap-2 text-sm">
              {results.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <span>{r.email}</span>
                  <StatusBadge label={r.status === "created" ? "Criado" : r.message ?? "Erro"} tone={r.status === "created" ? "success" : "danger"} />
                </div>
              ))}
            </div>
          </div>
        )}
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
                    <h3 className="font-semibold text-[#0f172b]">{integration.name}</h3>
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
