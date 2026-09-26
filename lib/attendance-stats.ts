// Atraso conta como comparecimento; falta justificada sai do cálculo em vez de penalizar.
export function countsAsAttended(status: string) {
  return status === "PRESENT" || status === "LATE"
}

function scored<T extends { status: string }>(records: T[]) {
  return records.filter((r) => r.status !== "JUSTIFIED")
}

export function monthlyAttendanceSeries(
  records: Array<{ status: string; lessonStartsAt: Date }>,
  months = 5,
) {
  const now = new Date()
  const buckets: { label: string; year: number; month: number; present: number; total: number }[] = []

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      year: d.getFullYear(),
      month: d.getMonth(),
      present: 0,
      total: 0,
    })
  }

  for (const record of scored(records)) {
    const bucket = buckets.find(
      (b) => b.year === record.lessonStartsAt.getFullYear() && b.month === record.lessonStartsAt.getMonth(),
    )
    if (!bucket) continue
    bucket.total += 1
    if (countsAsAttended(record.status)) bucket.present += 1
  }

  return buckets.map((b) => ({
    label: b.label.charAt(0).toUpperCase() + b.label.slice(1),
    value: b.total === 0 ? 0 : Math.round((b.present / b.total) * 100),
  }))
}

/**
 * Variação entre os dois últimos pontos de uma série percentual, em **pontos
 * percentuais** (não em %: a diferença entre 40% e 50% é 10pp, não 25%).
 * Devolve null quando não há dois pontos com medição para comparar.
 */
export function trendInPoints(series: Array<{ value: number }>) {
  if (series.length < 2) return null
  const current = series[series.length - 1]
  const previous = series[series.length - 2]
  if (current.value === 0 && previous.value === 0) return null
  return current.value - previous.value
}

export function attendanceRate(records: Array<{ status: string }>) {
  const considered = scored(records)
  if (considered.length === 0) return 0
  const present = considered.filter((r) => countsAsAttended(r.status)).length
  return Math.round((present / considered.length) * 100)
}
