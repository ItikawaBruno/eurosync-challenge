// Filtros de período para as rotas de métricas. Sem parâmetro válido devolve
// null, e quem consome não aplica filtro nenhum — "desde o início".

export type DateRange = { gte: Date; lte?: Date }

/**
 * Lê `from`/`to` (ISO ou yyyy-mm-dd) ou `days` (janela relativa a agora).
 * `days` é ignorado quando `from` está presente.
 */
export function parsePeriod(params: URLSearchParams): DateRange | null {
  const from = params.get("from")
  const to = params.get("to")
  const days = params.get("days")

  if (from) {
    const gte = new Date(from)
    if (Number.isNaN(gte.getTime())) return null

    const range: DateRange = { gte }
    if (to) {
      const lte = new Date(to)
      if (!Number.isNaN(lte.getTime())) range.lte = lte
    }
    return range
  }

  if (days) {
    const parsed = Number(days)
    if (!Number.isInteger(parsed) || parsed <= 0) return null
    const gte = new Date()
    gte.setDate(gte.getDate() - parsed)
    return { gte }
  }

  return null
}

/**
 * Converte uma data sem hora ("2026-10-10", vinda de `<input type="date">`) em
 * Date à meia-noite **local**.
 *
 * `new Date("2026-10-10")` é interpretado como meia-noite UTC. Ao renderizar com
 * `toLocaleDateString` em fuso negativo (BRT = UTC-3) isso volta um dia: o
 * usuário escolhia 10/10 e todos liam 09/10.
 */
export function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

/** Intervalo fechado do mês deslocado `monthsAgo` meses para trás (0 = mês atual). */
export function monthRange(monthsAgo: number): DateRange {
  const now = new Date()
  const gte = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
  const lte = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 1)
  lte.setMilliseconds(-1)
  return { gte, lte }
}
