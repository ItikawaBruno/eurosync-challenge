import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card } from "@/components/platform/ui/card"
import { StatusBadge } from "@/components/platform/ui/status-badge"

type ApiClass = { id: string; name: string; status: string; description?: string | null; _count?: { students?: number; lessons?: number } }

export function ProfessorClassCard({ classGroup }: { classGroup: ApiClass }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{classGroup.name}</h2>
          {classGroup.description && <p className="mt-1 text-sm text-muted-foreground">{classGroup.description}</p>}
        </div>
        <StatusBadge label={classGroup.status} />
      </div>
      <dl className="mt-5 grid gap-3 text-sm">
        <div className="flex justify-between"><dt className="text-muted-foreground">Alunos</dt><dd className="font-medium">{classGroup._count?.students ?? 0}</dd></div>
        <div className="flex justify-between"><dt className="text-muted-foreground">Aulas</dt><dd className="font-medium">{classGroup._count?.lessons ?? 0}</dd></div>
      </dl>
      <Link href={`/professor/classes/${classGroup.id}`} className="mt-5 flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">Abrir detalhes<ArrowRight className="ml-2 h-4 w-4" /></Link>
    </Card>
  )
}

