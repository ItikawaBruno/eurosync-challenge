import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/fetcher"

export type ImportRow = { name: string; email: string; role: string }
export type ImportResult = { email: string; status: "created" | "error"; message?: string }

export function useImportUsers() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (rows: ImportRow[]) =>
      apiFetch<{ results: ImportResult[] }>("/api/users/import", { method: "POST", body: JSON.stringify({ rows }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })
  return {
    mutate: (rows: ImportRow[], options?: { onSuccess?: (data: { results: ImportResult[] }) => void }) =>
      mutation.mutate(rows, options),
    isPending: mutation.isPending,
    data: mutation.data,
  }
}
