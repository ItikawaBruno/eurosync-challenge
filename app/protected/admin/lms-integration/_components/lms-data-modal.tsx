"use client"

import { useEffect } from "react"
import { AppModal, useOverlayState } from "@/components/platform/ui/app-modal"
import { TableSkeleton } from "@/components/platform/ui/loading"
import { useLmsData, type LmsSyncEntity } from "@/hooks/use-lms"

const entityLabels: Record<LmsSyncEntity, string> = {
  courses: "Cursos",
  classes: "Turmas",
  students: "Educandos",
  professors: "Professores",
  enrollments: "Matriculas",
  progress: "Progresso",
  attendance: "Frequencia",
  activities: "Atividades",
  grades: "Notas",
  completions: "Conclusoes",
}

export function LmsDataModal({
  entity,
  onClose,
}: {
  entity: LmsSyncEntity | null
  onClose: () => void
}) {
  const state = useOverlayState()

  useEffect(() => {
    if (entity) {
      state.open()
    }
  }, [entity])

  const handleClose = () => {
    state.close()
    onClose()
  }

  if (!entity) return null

  return (
    <AppModal state={{ ...state, close: handleClose }} title={`Dados importados: ${entityLabels[entity]}`} size="xl">
      <LmsDataContent entity={entity} />
    </AppModal>
  )
}

function LmsDataContent({ entity }: { entity: LmsSyncEntity }) {
  const { data, isPending } = useLmsData(entity)

  if (isPending) return <TableSkeleton rows={5} />
  if (!data || (data as any[]).length === 0) return <p className="text-sm text-muted-foreground">Nenhum dado disponivel para esta entidade.</p>

  const items = data as any[]
  const columns = getColumnsForEntity(entity)

  return (
    <div className="max-h-96 overflow-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-3 py-2 font-semibold whitespace-nowrap">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item, idx) => (
            <tr key={item.id ?? idx} className="transition hover:bg-slate-50">
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-2 whitespace-nowrap">{col.render(item)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type ColumnDef = { key: string; label: string; render: (item: any) => string }

function getColumnsForEntity(entity: LmsSyncEntity): ColumnDef[] {
  switch (entity) {
    case "courses":
      return [
        { key: "name", label: "Nome", render: (i) => i.name },
        { key: "category", label: "Categoria", render: (i) => i.category },
        { key: "workload", label: "Carga Horaria", render: (i) => `${i.workload}h` },
        { key: "status", label: "Status", render: (i) => i.status },
      ]
    case "classes":
      return [
        { key: "courseName", label: "Curso", render: (i) => i.courseName },
        { key: "professorName", label: "Professor", render: (i) => i.professorName },
        { key: "period", label: "Periodo", render: (i) => i.period },
        { key: "enrolledCount", label: "Alunos", render: (i) => String(i.enrolledCount) },
        { key: "status", label: "Status", render: (i) => i.status },
      ]
    case "students":
      return [
        { key: "name", label: "Nome", render: (i) => i.name },
        { key: "email", label: "Email", render: (i) => i.email },
        { key: "enrollment", label: "Matricula", render: (i) => i.enrollment },
        { key: "progress", label: "Progresso", render: (i) => `${i.progress}%` },
        { key: "digitalPresence", label: "Presenca", render: (i) => `${i.digitalPresence}%` },
        { key: "status", label: "Status", render: (i) => i.status },
      ]
    case "professors":
      return [
        { key: "name", label: "Nome", render: (i) => i.name },
        { key: "email", label: "Email", render: (i) => i.email },
        { key: "department", label: "Departamento", render: (i) => i.department },
        { key: "coursesCount", label: "Cursos", render: (i) => String(i.coursesCount) },
      ]
    case "enrollments":
      return [
        { key: "studentName", label: "Aluno", render: (i) => i.studentName },
        { key: "className", label: "Turma", render: (i) => i.className },
        { key: "status", label: "Status", render: (i) => i.status },
        { key: "enrolledAt", label: "Data", render: (i) => formatDate(i.enrolledAt) },
      ]
    case "progress":
      return [
        { key: "studentName", label: "Aluno", render: (i) => i.studentName },
        { key: "courseName", label: "Curso", render: (i) => i.courseName },
        { key: "progressPercent", label: "Progresso", render: (i) => `${i.progressPercent}%` },
        { key: "status", label: "Status", render: (i) => i.status },
      ]
    case "attendance":
      return [
        { key: "studentName", label: "Aluno", render: (i) => i.studentName },
        { key: "className", label: "Turma", render: (i) => i.className },
        { key: "date", label: "Data", render: (i) => i.date },
        { key: "status", label: "Status", render: (i) => i.status },
        { key: "duration", label: "Duracao", render: (i) => `${i.duration}min` },
      ]
    case "activities":
      return [
        { key: "title", label: "Titulo", render: (i) => i.title },
        { key: "courseName", label: "Curso", render: (i) => i.courseName },
        { key: "type", label: "Tipo", render: (i) => i.type },
        { key: "dueDate", label: "Prazo", render: (i) => i.dueDate },
        { key: "status", label: "Status", render: (i) => i.status },
      ]
    case "grades":
      return [
        { key: "studentName", label: "Aluno", render: (i) => i.studentName },
        { key: "activityTitle", label: "Atividade", render: (i) => i.activityTitle },
        { key: "grade", label: "Nota", render: (i) => `${i.grade}/${i.maxGrade}` },
        { key: "percentage", label: "Percentual", render: (i) => `${i.percentage}%` },
      ]
    case "completions":
      return [
        { key: "studentName", label: "Aluno", render: (i) => i.studentName },
        { key: "courseName", label: "Curso", render: (i) => i.courseName },
        { key: "completionPercent", label: "Conclusao", render: (i) => `${i.completionPercent}%` },
        { key: "certificateIssued", label: "Certificado", render: (i) => i.certificateIssued ? "Sim" : "Nao" },
        { key: "status", label: "Status", render: (i) => i.status },
      ]
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR")
}
