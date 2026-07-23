import type { ReactNode } from "react"

type MetricCardProps = {
  title: string
  value: string | number
  description?: string
  trend?: string
  trendLabel?: string
  icon?: ReactNode
}

export function MetricCard({ title, value, description, trend, trendLabel, icon }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        {icon ? <div className="rounded-xl bg-slate-100 p-2 text-slate-700">{icon}</div> : null}
      </div>
      {(description || trend || trendLabel) && (
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          {description ? <span>{description}</span> : null}
          {trendLabel ? <span className={trend === "down" ? "text-rose-600" : "text-emerald-600"}>{trendLabel}</span> : null}
        </div>
      )}
    </div>
  )
}
