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

/** Intervalo fechado do mês deslocado `monthsAgo` meses para trás (0 = mês atual). */
export function monthRange(monthsAgo: number): DateRange {
  const now = new Date()
  const gte = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
  const lte = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 1)
  lte.setMilliseconds(-1)
  return { gte, lte }
}
