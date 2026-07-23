export function PageSpinner() {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Carregando...</div>
}

export function CardSkeleton() {
  return <div className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
}

type MetricsSkeletonProps = {
  count?: number
}

export function MetricsSkeleton({ count = 3 }: MetricsSkeletonProps) {
  return <div className="grid gap-3 md:grid-cols-3">{Array.from({ length: count }).map((_, index) => <CardSkeleton key={index} />)}</div>
}

type TableSkeletonProps = {
  rows?: number
}

export function TableSkeleton({ rows = 3 }: TableSkeletonProps) {
  return <div className="space-y-3">
    {Array.from({ length: rows }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />)}
  </div>
}
