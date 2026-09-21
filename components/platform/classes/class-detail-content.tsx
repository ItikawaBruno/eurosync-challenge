"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Card, SectionCard } from "@/components/platform/ui/card"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { Button } from "@/components/platform/ui/button"
import { Input, Textarea } from "@/components/platform/ui/forms"
import { DataTable } from "@/components/platform/ui/data-table"
import { AppModal, useOverlayState } from "@/components/platform/ui/app-modal"
import { CardSkeleton, PageSpinner } from "@/components/platform/ui/loading"
import { CountBarChart } from "@/components/platform/charts/platform-charts"
import { useClass, useClassStudents, useAddClassStudents } from "@/hooks/use-classes"
import { useClassTasks, useCreateTask, useDeleteTask } from "@/hooks/use-tasks"
import { useClassMetrics } from "@/hooks/use-class-metrics"
import { useUsers } from "@/hooks/use-user"
import { ClassLessonsSection } from "@/components/platform/classes/class-lessons-section"

export function ClassDetailContent({ classId }: { classId: string }) {
  const { data: cls } = useClass(classId)
  const { data: roster, isPending: rosterPending } = useClassStudents(classId)
  const { data: tasks, isPending: tasksPending } = useClassTasks(classId)
  const { data: metrics, isPending: metricsPending } = useClassMetrics(classId)
  const { data: allStudents } = useUsers("STUDENT")

  const addStudents = useAddClassStudents()
  const createTask = useCreateTask()
  const deleteTask = useDeleteTask(classId)

  const addStudentsModal = useOverlayState()
  const newTaskModal = useOverlayState()

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskDueDate, setTaskDueDate] = useState("")

  const enrolledIds = useMemo(() => new Set((roster ?? []).map((s) => s.id)), [roster])
  const availableStudents = useMemo(
    () => (allStudents ?? []).filter((s) => !enrolledIds.has(s.id)),
    [allStudents, enrolledIds],
  )

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const handleAddStudents = () => {
    if (selectedStudentIds.length === 0) return
    addStudents.mutate(
      { classId, studentIds: selectedStudentIds },
      { onSuccess: () => { setSelectedStudentIds([]); addStudentsModal.close() } },
    )
  }

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return
    createTask.mutate(
      { classId, title: taskTitle, description: taskDescription || undefined, dueDate: taskDueDate || undefined },
      { onSuccess: () => { setTaskTitle(""); setTaskDescription(""); setTaskDueDate(""); newTaskModal.close() } },
    )
  }

  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{cls?.name ?? "Detalhes da turma"}</h2>
            {cls?.description && <p className="mt-2 text-sm text-muted-foreground">{cls.description}</p>}
            {cls?.teacher && <p className="mt-1 text-sm text-muted-foreground">Professor: {cls.teacher.name}</p>}
          </div>
          <StatusBadge label={cls?.status ?? "Ativo"} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border p-4">
            <p className="text-sm text-muted-foreground">Alunos</p>
            <p className="mt-2 text-xl font-semibold">{cls?._count?.students ?? 0}</p>
          </div>
          <div className="rounded-3xl border p-4">
            <p className="text-sm text-muted-foreground">Aulas</p>
            <p className="mt-2 text-xl font-semibold">{cls?._count?.lessons ?? 0}</p>
          </div>
          <div className="rounded-3xl border p-4">
            <p className="text-sm text-muted-foreground">Tarefas</p>
            <p className="mt-2 text-xl font-semibold">{tasks?.length ?? 0}</p>
          </div>
        </div>
      </Card>

      <SectionCard
        title="Alunos matriculados"
        description="Gerencie quem participa deste grupo."
        action={<Button size="sm" variant="accent" onClick={addStudentsModal.open}><Plus className="mr-1 h-4 w-4" />Adicionar alunos</Button>}
      >
        {rosterPending ? <CardSkeleton /> : (
          <DataTable
            data={roster ?? []}
            getRowKey={(s) => s.id}
            columns={[
              { header: "Nome", accessor: "name" },
              { header: "E-mail", accessor: "email" },
              { header: "Matriculado em", cell: (s) => new Date(s.enrolledAt).toLocaleDateString("pt-BR") },
            ]}
          />
        )}
        {!rosterPending && !roster?.length && <p className="mt-3 text-sm text-muted-foreground">Nenhum aluno matriculado ainda.</p>}
      </SectionCard>

      <ClassLessonsSection classId={classId} />

      <SectionCard
        title="Tarefas"
        description="Atividades que os alunos precisam executar neste grupo."
        action={<Button size="sm" variant="accent" onClick={newTaskModal.open}><Plus className="mr-1 h-4 w-4" />Nova tarefa</Button>}
      >
        {tasksPending ? <CardSkeleton /> : (
          <div className="grid gap-3">
            {(tasks ?? []).map((task) => (
              <div key={task.id} className="flex items-start justify-between gap-3 rounded-xl border p-4">
                <div>
                  <p className="font-medium">{task.title}</p>
                  {task.description && <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>}
                  {task.dueDate && <p className="mt-1 text-xs text-muted-foreground">Prazo: {new Date(task.dueDate).toLocaleDateString("pt-BR")}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label={`${task.deliveredCount ?? 0}/${task.totalStudents} entregues`} tone={(task.deliveredCount ?? 0) >= task.totalStudents && task.totalStudents > 0 ? "success" : "warning"} />
                  <button className="rounded-lg border p-1.5 text-rose-600 hover:bg-rose-50" onClick={() => deleteTask.mutate(task.id)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {!tasks?.length && <p className="text-sm text-muted-foreground">Nenhuma tarefa criada ainda.</p>}
          </div>
        )}
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <SectionCard title="Adesao dos alunos" description="Entrega de tarefas e frequencia por aluno.">
          {metricsPending ? <CardSkeleton /> : (
            <DataTable
              data={metrics?.students ?? []}
              getRowKey={(s) => s.id}
              columns={[
                { header: "Aluno", accessor: "name" },
                { header: "Tarefas", cell: (s) => `${s.tasksDelivered}/${s.tasksTotal} (${s.taskRate}%)` },
                { header: "Frequencia", cell: (s) => `${s.attendanceRate}%` },
                { header: "Aderente", cell: (s) => <StatusBadge label={s.adherent ? "Aderente" : "Nao aderente"} tone={s.adherent ? "success" : "danger"} /> },
              ]}
            />
          )}
        </SectionCard>
        <SectionCard title="Evolucao de entregas" description="Tarefas entregues nos ultimos meses." contentClassName="h-[280px]">
          {metricsPending ? <PageSpinner /> : <CountBarChart data={metrics?.evolution ?? []} title="Entregas por mes" />}
        </SectionCard>
      </div>

      <AppModal
        state={addStudentsModal}
        title="Adicionar alunos"
        footer={
          <>
            <Button variant="outline" onClick={addStudentsModal.close}>Cancelar</Button>
            <Button variant="accent" onClick={handleAddStudents} disabled={addStudents.isPending || selectedStudentIds.length === 0}>Adicionar</Button>
          </>
        }
      >
        <div className="grid max-h-80 gap-2 overflow-y-auto">
          {availableStudents.map((student) => (
            <label key={student.id} className="flex items-center gap-3 rounded-xl border p-3 text-sm">
              <input type="checkbox" checked={selectedStudentIds.includes(student.id)} onChange={() => toggleStudent(student.id)} />
              <span className="font-medium">{student.name}</span>
              <span className="text-muted-foreground">{student.email}</span>
            </label>
          ))}
          {!availableStudents.length && <p className="text-sm text-muted-foreground">Todos os alunos ja estao matriculados.</p>}
        </div>
      </AppModal>

      <AppModal
        state={newTaskModal}
        title="Nova tarefa"
        footer={
          <>
            <Button variant="outline" onClick={newTaskModal.close}>Cancelar</Button>
            <Button variant="accent" onClick={handleCreateTask} disabled={createTask.isPending}>Criar</Button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Titulo</span>
            <Input required value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Descricao</span>
            <Textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Prazo</span>
            <Input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
          </label>
        </div>
      </AppModal>
    </div>
  )
}
