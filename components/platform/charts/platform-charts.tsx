type SeriesPoint = { label: string; value: number }

// Com os mocks removidos, série vazia passa a acontecer de verdade (banco novo,
// turma sem tarefa, período sem aula). Banco vazio precisa *parecer* banco
// vazio — antes o card renderizava em branco e lia como bug.
function ChartFrame({
  title,
  isEmpty,
  children,
}: {
  title: string
  isEmpty: boolean
  children: React.ReactNode
}) {
  return (
    <div className="h-full rounded-3xl border border-slate-200 bg-white p-6">
      <div className="text-sm text-muted-foreground">{title}</div>
      {isEmpty ? (
        <p className="mt-6 text-sm text-muted-foreground">Sem dados no periodo.</p>
      ) : (
        children
      )}
    </div>
  )
}

export function AttendanceLineChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ChartFrame title="Linha de frequência" isEmpty={data.length === 0}>
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
    </ChartFrame>
  )
}

export function CountBarChart({ data, title = "Evolucao" }: { data: SeriesPoint[]; title?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <ChartFrame title={title} isEmpty={data.length === 0}>
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
    </ChartFrame>
  )
}

export function EngagementBarChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ChartFrame title="Engajamento" isEmpty={data.length === 0}>
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
    </ChartFrame>
  )
}
