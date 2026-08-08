import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/fetcher"

type ClassRecord = {
  id: string
  name: string
  description: string | null
  status: string
  _count: { students: number; lessons: number }
}

export function useClasses() {
  const query = useQuery({
    queryKey: ["classes"],
    queryFn: () => apiFetch<ClassRecord[]>("/api/classes"),
  })
  return { data: query.data, isPending: query.isPending }
}

export function useClass(id: string) {
  const query = useQuery({
    queryKey: ["classes", id],
    queryFn: () => apiFetch<ClassRecord>(`/api/classes/${id}`),
    enabled: Boolean(id),
  })
  return { data: query.data, isPending: query.isPending }
}

export function useCreateClass() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: { name: string; description?: string; teacherId: string }) =>
      apiFetch<ClassRecord>("/api/classes", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["classes"] }),
  })
  return {
    mutate: (payload: { name: string; description?: string; teacherId: string }, options?: { onSuccess?: () => void }) =>
      mutation.mutate(payload, options),
    isPending: mutation.isPending,
  }
}

export function useUpdateClass() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: { id: string; name: string; description?: string }) =>
      apiFetch<ClassRecord>(`/api/classes/${payload.id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["classes"] }),
  })
  return {
    mutate: (payload: { id: string; name: string; description?: string }, options?: { onSuccess?: () => void }) =>
      mutation.mutate(payload, options),
    isPending: mutation.isPending,
  }
}

export function useDeleteClass() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: true }>(`/api/classes/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["classes"] }),
  })
  return {
    mutate: (id: string, options?: { onSuccess?: () => void }) => mutation.mutate(id, options),
    isPending: mutation.isPending,
  }
}

export function useAddClassStudents() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: { classId: string; studentIds: string[] }) =>
      apiFetch<ClassRecord>(`/api/classes/${payload.classId}/students`, {
        method: "POST",
        body: JSON.stringify({ studentIds: payload.studentIds }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["classes"] }),
  })
  return {
    mutate: (payload: { classId: string; studentIds: string[] }, options?: { onSuccess?: () => void }) =>
      mutation.mutate(payload, options),
    isPending: mutation.isPending,
  }
}
