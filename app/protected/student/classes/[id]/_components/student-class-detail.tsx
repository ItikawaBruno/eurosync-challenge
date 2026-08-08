"use client"

import { CheckCircle2, Circle } from "lucide-react"
import { SectionCard } from "@/components/platform/ui/card"
import { MetricCard } from "@/components/platform/ui/metric-card"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { CardSkeleton } from "@/components/platform/ui/loading"
import { useClassTasks, useSubmitTask, useUnsubmitTask } from "@/hooks/use-tasks"
import { useClassMetrics } from "@/hooks/use-class-metrics"
import { useMe } from "@/hooks/use-user"

export function StudentClassDetail({ classId }: { classId: string }) {
  const { data: tasks, isPending: tasksPending } = useClassTasks(classId)
  const { data: metrics } = useClassMetrics(classId)
  const { data: me } = useMe()
  const submitTask = useSubmitTask(classId)
  const unsubmitTask = useUnsubmitTask(classId)

  const myStats = metrics?.students.find((s) => s.id === me?.id)

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard title="Tarefas entregues" value={myStats ? `${myStats.tasksDelivered}/${myStats.tasksTotal}` : "-"} description={myStats ? `${myStats.taskRate}%` : undefined} />
        <MetricCard title="Frequencia" value={myStats ? `${myStats.attendanceRate}%` : "-"} />
        <MetricCard
          title="Situacao"
          value={myStats ? (myStats.adherent ? "Aderente" : "Nao aderente") : "-"}
        />
      </div>

      <SectionCard title="Tarefas do grupo" description="Marque como concluida quando terminar.">
        {tasksPending ? <CardSkeleton /> : (
          <div className="grid gap-3">
            {(tasks ?? []).map((task) => (
              <div key={task.id} className="flex items-start justify-between gap-3 rounded-xl border p-4">
                <div>
                  <p className="font-medium">{task.title}</p>
                  {task.description && <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>}
                  {task.dueDate && <p className="mt-1 text-xs text-muted-foreground">Prazo: {new Date(task.dueDate).toLocaleDateString("pt-BR")}</p>}
                </div>
                <button
                  className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                  onClick={() => (task.mySubmission ? unsubmitTask.mutate(task.id) : submitTask.mutate(task.id))}
                >
                  {task.mySubmission ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-slate-400" />}
                  <StatusBadge label={task.mySubmission ? "Concluida" : "Pendente"} tone={task.mySubmission ? "success" : "warning"} />
                </button>
              </div>
            ))}
            {!tasks?.length && <p className="text-sm text-muted-foreground">Nenhuma tarefa neste grupo ainda.</p>}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
