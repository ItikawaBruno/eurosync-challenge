import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/fetcher"
import type { ApiUser, UserRole } from "@/types/platform"

export function useMe() {
  const query = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<{ id: string; name: string; email: string; role: UserRole }>("/api/me"),
  })
  return { data: query.data, isPending: query.isPending }
}

export function useUsers(roleFilter?: string) {
  const query = useQuery({
    queryKey: ["users", roleFilter ?? "ALL"],
    queryFn: () => apiFetch<ApiUser[]>(`/api/users${roleFilter ? `?role=${roleFilter}` : ""}`),
  })
  return { data: query.data, isPending: query.isPending }
}

export function useUser(id: string) {
  const query = useQuery({
    queryKey: ["users", id],
    queryFn: () => apiFetch<ApiUser>(`/api/users/${id}`),
    enabled: Boolean(id),
  })
  return { data: query.data, isPending: query.isPending }
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: { id: string; name: string }) =>
      apiFetch<ApiUser>(`/api/users/${payload.id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })
  return {
    mutate: (payload: { id: string; name: string }, options?: { onSuccess?: () => void }) =>
      mutation.mutate(payload, options),
    isPending: mutation.isPending,
  }
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (id: string) => apiFetch<ApiUser>(`/api/users/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })
  return {
    mutate: (id: string, options?: { onSuccess?: () => void }) => mutation.mutate(id, options),
    isPending: mutation.isPending,
  }
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: { name: string; email: string; role: UserRole }) =>
      apiFetch<ApiUser>("/api/users", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })
  return {
    mutate: (payload: { name: string; email: string; role: UserRole }, options?: { onSuccess?: () => void }) =>
      mutation.mutate(payload, options),
    isPending: mutation.isPending,
  }
}

export type { ApiUser, UserRole }
