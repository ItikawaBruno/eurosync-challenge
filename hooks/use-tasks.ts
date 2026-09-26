import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/fetcher"

export type ClassTask = {
  id: string
  classId: string
  title: string
  description: string | null
  dueDate: string | null
  createdAt: string
  totalStudents: number
  deliveredCount?: number
  mySubmission?: boolean
}

export function useClassTasks(classId: string) {
  const query = useQuery({
    queryKey: ["tasks", classId],
    queryFn: () => apiFetch<ClassTask[]>(`/api/classes/${classId}/tasks`),
    enabled: Boolean(classId),
  })
  return { data: query.data, isPending: query.isPending }
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: { classId: string; title: string; description?: string; dueDate?: string }) =>
      apiFetch<ClassTask>(`/api/classes/${payload.classId}/tasks`, { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.classId] })
      queryClient.invalidateQueries({ queryKey: ["classes", variables.classId, "metrics"] })
      queryClient.invalidateQueries({ queryKey: ["classes", variables.classId] })
    },
  })
  return {
    mutate: (payload: { classId: string; title: string; description?: string; dueDate?: string }, options?: { onSuccess?: () => void }) =>
      mutation.mutate(payload, options),
    isPending: mutation.isPending,
  }
}

export function useDeleteTask(classId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: true }>(`/api/tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", classId] })
      queryClient.invalidateQueries({ queryKey: ["classes", classId, "metrics"] })
      queryClient.invalidateQueries({ queryKey: ["classes", classId] })
    },
  })
  return {
    mutate: (id: string, options?: { onSuccess?: () => void }) => mutation.mutate(id, options),
    isPending: mutation.isPending,
  }
}

export function useSubmitTask(classId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (taskId: string) => apiFetch(`/api/tasks/${taskId}/submit`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", classId] })
      queryClient.invalidateQueries({ queryKey: ["classes", classId, "metrics"] })
      queryClient.invalidateQueries({ queryKey: ["classes", classId] })
    },
  })
  return {
    mutate: (taskId: string, options?: { onSuccess?: () => void }) => mutation.mutate(taskId, options),
    isPending: mutation.isPending,
  }
}

export function useUnsubmitTask(classId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (taskId: string) => apiFetch(`/api/tasks/${taskId}/submit`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", classId] })
      queryClient.invalidateQueries({ queryKey: ["classes", classId, "metrics"] })
      queryClient.invalidateQueries({ queryKey: ["classes", classId] })
    },
  })
  return {
    mutate: (taskId: string, options?: { onSuccess?: () => void }) => mutation.mutate(taskId, options),
    isPending: mutation.isPending,
  }
}
