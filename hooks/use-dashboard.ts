import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/fetcher"

type AdminDashboard = {
  summary: { students: number; attendance: number; classes: number }
  totalStudents: number
  totalClasses: number
  averageAttendance: number
  studentsAtRisk: number
  monthlyAttendance: { label: string; value: number }[]
  totalLessons: number
  openAlerts: number
}

type ProfessorDashboard = {
  summary: { lessons: number; students: number; alerts: number }
  attendanceAverage: number
  myClasses: { id: string; name: string }[]
  studentsAtRisk: { id: string }[]
  monthlyAttendance: { label: string; value: number }[]
}

type StudentDashboard = {
  summary: { attendance: number; lessons: number; nextLesson: string | null }
  attendance: { rate: number; present: number; total: number }
  nextLesson: { title: string; startsAt: string } | null
}

export function useAdminDashboard() {
  const query = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: () => apiFetch<AdminDashboard>("/api/dashboard/admin"),
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
