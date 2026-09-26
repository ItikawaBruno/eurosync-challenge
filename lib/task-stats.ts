export const ADHERENCE_TASK_THRESHOLD = 80
export const ADHERENCE_ATTENDANCE_THRESHOLD = 75

export function taskDeliveryRate(delivered: number, total: number) {
  if (total === 0) return 100
  return Math.round((delivered / total) * 100)
}

export function isAdherent(taskRate: number, attendanceRate: number) {
  return taskRate >= ADHERENCE_TASK_THRESHOLD && attendanceRate >= ADHERENCE_ATTENDANCE_THRESHOLD
}

// Engajamento de uma turma: entregas feitas sobre entregas esperadas
// (nº de tarefas × nº de alunos matriculados).
// Devolve null quando não há o que medir — turma sem tarefa ou sem aluno não tem
// 0% de engajamento, tem engajamento *não medido*. Quem consome deve descartar.
export function classEngagementRate(input: { tasks: number; students: number; submissions: number }) {
  const expected = input.tasks * input.students
  if (expected === 0) return null
  return Math.round((input.submissions / expected) * 100)
}

export type EngagementPoint = { label: string; value: number }

export function classEngagementSeries(
  classes: Array<{ name: string; students: number; tasks: Array<{ submissions: number }> }>,
  limit = 5,
): EngagementPoint[] {
  return classes
    .map((klass) => ({
      label: klass.name,
      value: classEngagementRate({
        tasks: klass.tasks.length,
        students: klass.students,
        submissions: klass.tasks.reduce((sum, task) => sum + task.submissions, 0),
      }),
    }))
    .filter((point): point is EngagementPoint => point.value !== null)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
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
