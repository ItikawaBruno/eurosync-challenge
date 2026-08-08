import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/fetcher"

export type ClassMetrics = {
  totalStudents: number
  totalTasks: number
  taskStats: { taskId: string; title: string; delivered: number; total: number; pending: number }[]
  students: {
    id: string
    name: string
    tasksDelivered: number
    tasksTotal: number
    taskRate: number
    attendanceRate: number
    adherent: boolean
  }[]
  evolution: { label: string; value: number }[]
}

export function useClassMetrics(classId: string) {
  const query = useQuery({
    queryKey: ["classes", classId, "metrics"],
    queryFn: () => apiFetch<ClassMetrics>(`/api/classes/${classId}/metrics`),
    enabled: Boolean(classId),
  })
  return { data: query.data, isPending: query.isPending }
}
