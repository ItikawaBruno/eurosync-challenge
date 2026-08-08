export const ADHERENCE_TASK_THRESHOLD = 80
export const ADHERENCE_ATTENDANCE_THRESHOLD = 75

export function taskDeliveryRate(delivered: number, total: number) {
  if (total === 0) return 100
  return Math.round((delivered / total) * 100)
}

export function isAdherent(taskRate: number, attendanceRate: number) {
  return taskRate >= ADHERENCE_TASK_THRESHOLD && attendanceRate >= ADHERENCE_ATTENDANCE_THRESHOLD
}

export function monthlySubmissionSeries(records: Array<{ submittedAt: Date }>, months = 5) {
  const now = new Date()
  const buckets: { label: string; year: number; month: number; count: number }[] = []

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      year: d.getFullYear(),
      month: d.getMonth(),
      count: 0,
    })
  }

  for (const record of records) {
    const bucket = buckets.find(
      (b) => b.year === record.submittedAt.getFullYear() && b.month === record.submittedAt.getMonth(),
    )
    if (bucket) bucket.count += 1
  }

  return buckets.map((b) => ({
    label: b.label.charAt(0).toUpperCase() + b.label.slice(1),
    value: b.count,
  }))
}
