import { type ReactNode } from "react"

export function AttendanceLineChart({ data }: { data: Array<{ label: string; value: number }> }) {
  return (
    <div className="h-full rounded-3xl border border-slate-200 bg-white p-6">
      <div className="text-sm text-muted-foreground">Linha de frequência</div>
      <div className="mt-6 grid gap-2 text-sm text-slate-900">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-24 text-sm text-muted-foreground">{item.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-violet-600" style={{ width: `${item.value}%` }} />
            </div>
            <span className="w-12 text-right font-semibold">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CountBarChart({ data, title = "Evolucao" }: { data: Array<{ label: string; value: number }>; title?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="h-full rounded-3xl border border-slate-200 bg-white p-6">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-6 grid gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-24 text-sm text-muted-foreground">{item.label}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-sky-600" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
            <span className="w-10 text-right font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EngagementBarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  return (
    <div className="h-full rounded-3xl border border-slate-200 bg-white p-6">
      <div className="text-sm text-muted-foreground">Engajamento</div>
      <div className="mt-6 grid gap-3">
        {data.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{item.label}</span>
              <span className="font-semibold">{item.value}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
