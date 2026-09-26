import { BookOpen, Users, GraduationCap, ClipboardCheck } from "lucide-react"
import { MetricCard } from "@/components/platform/ui/metric-card"

interface SyncEntityState {
  count: number
  lastSync: string | null
  status: string
}

interface LmsSyncOverview {
  courses: SyncEntityState
  classes: SyncEntityState
  students: SyncEntityState
  professors: SyncEntityState
  enrollments: SyncEntityState
  progress: SyncEntityState
  attendance: SyncEntityState
  activities: SyncEntityState
  grades: SyncEntityState
  completions: SyncEntityState
}

export function LmsSyncCards({ overview }: { overview: LmsSyncOverview }) {
  const totalRecords =
    overview.courses.count +
    overview.classes.count +
    overview.students.count +
    overview.professors.count +
    overview.enrollments.count

  const totalAcademic =
    overview.progress.count +
    overview.attendance.count +
    overview.activities.count +
    overview.grades.count +
    overview.completions.count

  const lastSync = getLatestSync(overview)

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="Cursos importados"
        value={String(overview.courses.count)}
        description={overview.courses.lastSync ? formatDate(overview.courses.lastSync) : "Nao sincronizado"}
        icon={<BookOpen className="h-5 w-5" />}
      />
      <MetricCard
        title="Educandos importados"
        value={String(overview.students.count)}
        description={overview.students.lastSync ? formatDate(overview.students.lastSync) : "Nao sincronizado"}
        icon={<Users className="h-5 w-5" />}
      />
      <MetricCard
        title="Registros academicos"
        value={String(totalAcademic)}
        description={totalAcademic > 0 ? "Progresso, notas, presenca" : "Nao sincronizado"}
        icon={<GraduationCap className="h-5 w-5" />}
      />
      <MetricCard
        title="Total sincronizado"
        value={String(totalRecords + totalAcademic)}
        description={lastSync ? `Ultima: ${formatDate(lastSync)}` : "Nenhuma sincronizacao"}
        icon={<ClipboardCheck className="h-5 w-5" />}
      />
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getLatestSync(overview: LmsSyncOverview): string | null {
  const dates = Object.values(overview)
    .map((e) => e.lastSync)
    .filter(Boolean) as string[]
  if (dates.length === 0) return null
  return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
}
