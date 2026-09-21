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

export function attendanceRate(records: Array<{ status: string }>) {
  const considered = scored(records)
  if (considered.length === 0) return 0
  const present = considered.filter((r) => countsAsAttended(r.status)).length
  return Math.round((present / considered.length) * 100)
}
