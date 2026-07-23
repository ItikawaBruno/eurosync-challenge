import { Download, FileText } from "lucide-react"
import { MetricCard } from "@/components/platform/ui/metric-card"
import { Button } from "@/components/platform/ui/button"
import { FilterBar } from "@/components/platform/ui/forms"
import { DataTable, type Column } from "@/components/platform/ui/data-table"
import { useAdminDashboard } from "@/hooks/use-dashboard"
import { useClasses } from "@/hooks/use-classes"
import { PageSpinner } from "@/components/platform/ui/loading"

type ReportRow = { name: string; students: number; lessons: number; status: string }

export function ReportsPanel() {
  const { data: dashboard, isPending: dashLoading } = useAdminDashboard()
  const { data: classes, isPending: classesLoading } = useClasses()

  if (dashLoading || classesLoading) return <PageSpinner />

  const rows: ReportRow[] = (classes ?? []).map((cls) => ({
    name: cls.name,
    students: (cls as any)._count?.students ?? 0,
    lessons: (cls as any)._count?.lessons ?? 0,
    status: cls.status,
  }))

  const columns: Array<Column<ReportRow>> = [
    { key: "turma", header: "Turma", cell: (row) => <span className="font-medium">{row.name}</span> },
    { key: "alunos", header: "Alunos", cell: (row) => row.students },
    { key: "aulas", header: "Aulas", cell: (row) => row.lessons },
    { key: "status", header: "Status", cell: (row) => row.status },
  ]

  return (
    <div className="grid gap-6">
      <FilterBar searchPlaceholder="Filtrar relatorios por turma">
        <Button variant="outline">Periodo</Button>
        <Button variant="outline">Turma</Button>
        <Button variant="outline">Status</Button>
        <Button variant="secondary"><Download className="h-4 w-4" />CSV</Button>
        <Button variant="secondary"><FileText className="h-4 w-4" />PDF</Button>
      </FilterBar>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Frequencia media" value={`${dashboard?.averageAttendance ?? 0}%`} description="periodo selecionado" icon={<Download className="h-5 w-5" />} />
        <MetricCard title="Total de aulas" value={String(dashboard?.totalLessons ?? 0)} description="aulas registradas" icon={<FileText className="h-5 w-5" />} />
        <MetricCard title="Alunos em risco" value={String(dashboard?.studentsAtRisk ?? 0)} description="baixa frequencia ou engajamento" icon={<FileText className="h-5 w-5" />} />
      </div>
      <DataTable columns={columns} data={rows} getRowKey={(row) => row.name} />
    </div>
  )
}
