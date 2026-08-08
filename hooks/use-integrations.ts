import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/fetcher"

type Integration = { id: string; name: string; provider: string; baseUrl: string | null; status: string }

export function useIntegrations() {
  const query = useQuery({
    queryKey: ["integrations"],
    queryFn: () => apiFetch<Integration[]>("/api/integrations"),
  })
  return { data: query.data, isPending: query.isPending }
}
