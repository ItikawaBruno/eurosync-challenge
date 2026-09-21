"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/platform/ui/button"
import { useGenerateAlerts } from "@/hooks/use-alerts"

export function GenerateAlertsButton() {
  const generate = useGenerateAlerts()
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleClick = () => {
    setFeedback(null)
    generate.mutate({
      onSuccess: (result) =>
        setFeedback(`${result.created} novo(s) alerta(s) · ${result.resolved} encerrado(s)`),
      onError: (error) => setFeedback(error.message),
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="primary" onClick={handleClick} disabled={generate.isPending}>
        <RefreshCw className={`h-4 w-4 ${generate.isPending ? "animate-spin" : ""}`} />
        {generate.isPending ? "Analisando turmas..." : "Gerar alertas"}
      </Button>
      {feedback && <p className="text-xs text-slate-500">{feedback}</p>}
    </div>
  )
}
