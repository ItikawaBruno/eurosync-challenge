import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/fetcher"

type LessonRecord = {
  id: string
  classId: string
  title: string
  startsAt: string
  endsAt: string
  status: string
  locationName?: string | null
  locationLat?: number | null
  locationLng?: number | null
  locationRadiusM?: number | null
  qrCodeToken?: string | null
}

type LessonLocation = {
  locationName?: string
  locationLat?: number | null
  locationLng?: number | null
  locationRadiusM?: number | null
}

type CreateLessonPayload = {
  classId: string
  title: string
  startsAt: string
  endsAt: string
} & LessonLocation

type UpdateLessonPayload = {
  id: string
  title?: string
  startsAt?: string
  endsAt?: string
  status?: string
} & LessonLocation

type LessonsOptions = {
  /** Só aulas a partir de agora, em ordem crescente. */
  upcoming?: boolean
  /** Limita a janela a N dias à frente. Requer `upcoming`. */
  days?: number
}

export function useLessons(classId?: string, options?: LessonsOptions) {
  const search = new URLSearchParams()
  if (classId) search.set("classId", classId)
  if (options?.upcoming) search.set("upcoming", "true")
  if (options?.upcoming && options.days) search.set("days", String(options.days))
  const queryString = search.toString()

  const query = useQuery({
    // Os parâmetros entram na chave: sem isso "todas as aulas" e "próximas 7 dias"
    // compartilhariam cache e uma serviria a resposta da outra.
    queryKey: ["lessons", classId ?? "ALL", options?.upcoming ?? false, options?.days ?? null],
    queryFn: () => apiFetch<LessonRecord[]>(`/api/lessons${queryString ? `?${queryString}` : ""}`),
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
    mutationFn: (payload: CreateLessonPayload) =>
      apiFetch<LessonRecord>("/api/lessons", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] })
      queryClient.invalidateQueries({ queryKey: ["classes"] })
    },
  })
  return {
    mutate: (payload: CreateLessonPayload, options?: { onSuccess?: () => void }) =>
      mutation.mutate(payload, options),
    isPending: mutation.isPending,
  }
}

export function useDeleteLesson() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: true }>(`/api/lessons/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] })
      queryClient.invalidateQueries({ queryKey: ["classes"] })
    },
  })
  return {
    mutate: (id: string, options?: { onSuccess?: () => void }) => mutation.mutate(id, options),
    isPending: mutation.isPending,
  }
}

export function useUpdateLesson() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: UpdateLessonPayload) =>
      apiFetch<LessonRecord>(`/api/lessons/${payload.id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] })
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
      queryClient.invalidateQueries({ queryKey: ["alerts"] })
    },
  })
  return {
    mutate: (payload: UpdateLessonPayload, options?: { onSuccess?: () => void }) =>
      mutation.mutate(payload, options),
    isPending: mutation.isPending,
  }
}
