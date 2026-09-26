"use client"

import { useMemo, useState } from "react"
import { CalendarRange, Download, FileText, TrendingUp, Users } from "lucide-react"
import { MetricCard } from "@/components/platform/ui/metric-card"
import { Button } from "@/components/platform/ui/button"
import { FilterBar } from "@/components/platform/ui/forms"
import { DataTable, type Column } from "@/components/platform/ui/data-table"
import { useAdminDashboard, type DashboardPeriod } from "@/hooks/use-dashboard"
import { useClasses } from "@/hooks/use-classes"
import { PageSpinner } from "@/components/platform/ui/loading"
import { toCsv, downloadCsv } from "@/lib/csv"

type ReportRow = { name: string; teacher: string; students: number; lessons: number; status: string }

// Períodos oferecidos. `undefined` = desde o início, sem filtro na query.
const PERIOD_OPTIONS = [
  { value: "ALL", label: "Desde o inicio", period: undefined as DashboardPeriod | undefined },
  { value: "30", label: "Ultimos 30 dias", period: { days: 30 } },
  { value: "90", label: "Ultimos 90 dias", period: { days: 90 } },
] as const

const STATUS_OPTIONS = ["ALL", "ACTIVE", "INACTIVE", "ARCHIVED"] as const

const CSV_COLUMNS = [
  { key: "name" as const, header: "Turma" },
  { key: "teacher" as const, header: "Professor" },
  { key: "students" as const, header: "Alunos" },
  { key: "lessons" as const, header: "Aulas" },
  { key: "status" as const, header: "Status" },
]

export function ReportsPanel() {
  const [periodValue, setPeriodValue] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [search, setSearch] = useState("")

  const period = PERIOD_OPTIONS.find((option) => option.value === periodValue)?.period

  const { data: dashboard, isPending: dashLoading } = useAdminDashboard(period)
  const { data: classes, isPending: classesLoading } = useClasses()

  const rows = useMemo<ReportRow[]>(() => {
    const term = search.trim().toLowerCase()
    return (classes ?? [])
      .filter((cls) => statusFilter === "ALL" || cls.status === statusFilter)
      .filter((cls) => !term || cls.name.toLowerCase().includes(term))
      .map((cls) => ({
        name: cls.name,
        teacher: cls.teacher?.name ?? "-",
        students: cls._count?.students ?? 0,
        lessons: cls._count?.lessons ?? 0,
        status: cls.status,
      }))
  }, [classes, search, statusFilter])

  if (dashLoading || classesLoading) return <PageSpinner />

  const periodLabel = PERIOD_OPTIONS.find((option) => option.value === periodValue)?.label ?? ""

  const handleExportCsv = () => {
    downloadCsv(
      `relatorio-turmas-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(rows, CSV_COLUMNS),
    )
  }

  const columns: Array<Column<ReportRow>> = [
    { key: "turma", header: "Turma", cell: (row) => <span className="font-medium">{row.name}</span> },
    { key: "professor", header: "Professor", cell: (row) => row.teacher },
    { key: "alunos", header: "Alunos", cell: (row) => row.students },
    { key: "aulas", header: "Aulas", cell: (row) => row.lessons },
    { key: "status", header: "Status", cell: (row) => row.status },
  ]

  return (
    <div className="grid gap-6">
      <FilterBar
        searchPlaceholder="Filtrar relatorios por turma"
        searchValue={search}
        onSearchChange={setSearch}
      >
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarRange className="h-4 w-4" />
          <select
            aria-label="Periodo"
            value={periodValue}
            onChange={(event) => setPeriodValue(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <select
          aria-label="Status da turma"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>{status === "ALL" ? "Todos os status" : status}</option>
          ))}
        </select>
        <Button variant="secondary" onClick={handleExportCsv} disabled={rows.length === 0}>
          <Download className="h-4 w-4" />CSV
        </Button>
      </FilterBar>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Frequencia media"
          value={`${dashboard?.averageAttendance ?? 0}%`}
          description={periodLabel.toLowerCase()}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          title="Total de aulas"
          value={String(dashboard?.totalLessons ?? 0)}
          description={periodLabel.toLowerCase()}
          icon={<FileText className="h-5 w-5" />}
        />
        <MetricCard
          title="Alunos em risco"
          value={String(dashboard?.studentsAtRisk ?? 0)}
          // Contagem do estado atual (alertas abertos), não do período.
          description="alertas abertos agora"
          icon={<Users className="h-5 w-5" />}
        />
      </div>
      <DataTable columns={columns} data={rows} getRowKey={(row) => row.name} />
      {rows.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Nenhuma turma corresponde aos filtros selecionados.
        </p>
      )}
    </div>
  )
}
