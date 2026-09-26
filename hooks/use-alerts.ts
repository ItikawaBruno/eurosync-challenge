import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/fetcher"

export type AlertRecord = {
  id: string
  status: string
  severity: string
  type: string
  message: string
  student: { name: string } | null
  class: { name: string } | null
}

export function useAlerts() {
  const query = useQuery({
    queryKey: ["alerts"],
    queryFn: () => apiFetch<AlertRecord[]>("/api/alerts"),
  })
  return { data: query.data, isPending: query.isPending, isError: query.isError }
}

export function useUpdateAlert() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: { id: string; status: string }) =>
      apiFetch<AlertRecord>(`/api/alerts/${payload.id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  })
  return {
    mutate: (payload: { id: string; status: string }, options?: { onSuccess?: () => void }) =>
      mutation.mutate(payload, options),
    isPending: mutation.isPending,
  }
}

type GenerateResult = { created: number; resolved: number; evaluated: number }

export function useGenerateAlerts() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => apiFetch<GenerateResult>("/api/alerts/generate", { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  })
  return {
    mutate: (options?: { onSuccess?: (result: GenerateResult) => void; onError?: (error: Error) => void }) =>
      mutation.mutate(undefined, options),
    isPending: mutation.isPending,
  }
}

export function useCreateAlert() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: { type: string; severity: string; message: string; studentId?: string; classId?: string }) =>
      apiFetch<AlertRecord>("/api/alerts", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  })
  return {
    mutate: (
      payload: { type: string; severity: string; message: string; studentId?: string; classId?: string },
      options?: { onSuccess?: () => void },
    ) => mutation.mutate(payload, options),
    isPending: mutation.isPending,
  }
}
