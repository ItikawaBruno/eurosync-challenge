import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/fetcher"

export type LmsSyncEntity =
  | "courses"
  | "classes"
  | "students"
  | "professors"
  | "enrollments"
  | "progress"
  | "attendance"
  | "activities"
  | "grades"
  | "completions"

type EntityState = { count: number; lastSync: string | null; status: string }

type LmsOverview = { syncs: number; pending: number } & Record<LmsSyncEntity, EntityState>

type LmsSyncLog = {
  id: string
  timestamp: string
  action: string
  entity: string
  recordsProcessed: number
  status: string
  message: string
}

export function useLmsOverview() {
  const query = useQuery({
    queryKey: ["lms", "overview"],
    queryFn: () => apiFetch<LmsOverview>("/api/lms/overview"),
  })
  return { data: query.data, isPending: query.isPending }
}

export function useLmsSyncAll() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => apiFetch("/api/lms/sync-all", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms"] })
    },
  })
  return {
    mutate: (_payload?: unknown, options?: { onSuccess?: () => void }) => mutation.mutate(undefined, options),
    isPending: mutation.isPending,
  }
}

export function useLmsReset() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => apiFetch("/api/lms/reset", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms"] })
    },
  })
  return {
    mutate: (_payload?: unknown, options?: { onSuccess?: () => void }) => mutation.mutate(undefined, options),
    isPending: mutation.isPending,
  }
}

export function useLmsLogs() {
  const query = useQuery({
    queryKey: ["lms", "logs"],
    queryFn: () => apiFetch<LmsSyncLog[]>("/api/lms/logs"),
  })
  return { data: query.data, isPending: query.isPending }
}

export function useLmsData(entity: LmsSyncEntity) {
  const query = useQuery({
    queryKey: ["lms", "data", entity],
    queryFn: () => apiFetch<unknown[]>(`/api/lms/data/${entity}`),
    enabled: Boolean(entity),
  })
  return { data: query.data, isPending: query.isPending }
}

export function useLmsSyncEntity() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (entity: LmsSyncEntity) => apiFetch(`/api/lms/sync/${entity}`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms"] })
    },
  })
  return {
    mutate: (entity: LmsSyncEntity, options?: { onSuccess?: () => void }) => mutation.mutate(entity, options),
    isPending: mutation.isPending,
  }
}
