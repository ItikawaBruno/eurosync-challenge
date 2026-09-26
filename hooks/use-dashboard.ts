import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/fetcher"

export type SeriesPoint = { label: string; value: number }

/** Ponto de série temporal que distingue "0%" de "período sem medição". */
export type MeasuredPoint = SeriesPoint & { measured: boolean }

/** Variações calculadas a partir do banco. `null` = sem histórico para comparar. */
type AdminTrends = {
  studentsDelta: number
  attendancePp: number | null
}

type AdminDashboard = {
  summary: { students: number; attendance: number; classes: number }
  totalStudents: number
  totalClasses: number
  averageAttendance: number
  studentsAtRisk: number
  monthlyAttendance: MeasuredPoint[]
  engagementByClass: SeriesPoint[]
  totalLessons: number
  openAlerts: number
  trends: AdminTrends
}

type ProfessorDashboard = {
  summary: { lessons: number; students: number; alerts: number }
  attendanceAverage: number
  myClasses: { id: string; name: string }[]
  studentsAtRisk: { id: string | null }[]
  monthlyAttendance: MeasuredPoint[]
  engagementByClass: SeriesPoint[]
}

type StudentDashboard = {
  summary: { attendance: number; lessons: number; nextLesson: string | null }
  attendance: { rate: number; present: number; total: number }
  nextLesson: { title: string; startsAt: string } | null
}

/** Janela de apuração das métricas sensíveis a período. Omitir = desde o início. */
export type DashboardPeriod = { days?: number; from?: string; to?: string }

function periodQuery(period?: DashboardPeriod) {
  const search = new URLSearchParams()
  if (period?.days) search.set("days", String(period.days))
  if (period?.from) search.set("from", period.from)
  if (period?.to) search.set("to", period.to)
  const value = search.toString()
  return value ? `?${value}` : ""
}

export function useAdminDashboard(period?: DashboardPeriod) {
  const query = useQuery({
    queryKey: ["dashboard", "admin", period?.days ?? null, period?.from ?? null, period?.to ?? null],
    queryFn: () => apiFetch<AdminDashboard>(`/api/dashboard/admin${periodQuery(period)}`),
  })
  return { data: query.data, isPending: query.isPending }
}

export function useProfessorDashboard() {
  const query = useQuery({
    queryKey: ["dashboard", "professor"],
    queryFn: () => apiFetch<ProfessorDashboard>("/api/dashboard/professor"),
  })
  return { data: query.data, isPending: query.isPending }
}

export function useStudentDashboard() {
  const query = useQuery({
    queryKey: ["dashboard", "student"],
    queryFn: () => apiFetch<StudentDashboard>("/api/dashboard/student"),
  })
  return { data: query.data, isPending: query.isPending }
}
