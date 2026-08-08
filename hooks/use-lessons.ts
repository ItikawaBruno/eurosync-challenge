import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/fetcher"

type LessonRecord = {
  id: string
  title: string
  startsAt: string
  endsAt: string
  status: string
  locationName?: string | null
}

export function useLessons(classId?: string) {
  const query = useQuery({
    queryKey: ["lessons", classId ?? "ALL"],
    queryFn: () => apiFetch<LessonRecord[]>(`/api/lessons${classId ? `?classId=${classId}` : ""}`),
  })
  return { data: query.data, isPending: query.isPending }
}

export function useLesson(id: string) {
  const query = useQuery({
    queryKey: ["lessons", id],
    queryFn: () => apiFetch<LessonRecord>(`/api/lessons/${id}`),
    enabled: Boolean(id),
  })
  return { data: query.data, isPending: query.isPending }
}

export function useCreateLesson() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: { classId: string; title: string; startsAt: string; endsAt: string; locationName?: string }) =>
      apiFetch<LessonRecord>("/api/lessons", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lessons"] }),
  })
  return {
    mutate: (
      payload: { classId: string; title: string; startsAt: string; endsAt: string; locationName?: string },
      options?: { onSuccess?: () => void },
    ) => mutation.mutate(payload, options),
    isPending: mutation.isPending,
  }
}

export function useDeleteLesson() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: true }>(`/api/lessons/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lessons"] }),
  })
  return {
    mutate: (id: string, options?: { onSuccess?: () => void }) => mutation.mutate(id, options),
    isPending: mutation.isPending,
  }
}

export function useUpdateLesson() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: { id: string; title?: string; startsAt?: string; endsAt?: string; status?: string; locationName?: string }) =>
      apiFetch<LessonRecord>(`/api/lessons/${payload.id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lessons"] }),
  })
  return {
    mutate: (
      payload: { id: string; title?: string; startsAt?: string; endsAt?: string; status?: string; locationName?: string },
      options?: { onSuccess?: () => void },
    ) => mutation.mutate(payload, options),
    isPending: mutation.isPending,
  }
}
