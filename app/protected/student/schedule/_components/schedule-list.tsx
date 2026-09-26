"use client"

import { MapPin } from "lucide-react"
import { SectionCard } from "@/components/platform/ui/card"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { CardSkeleton } from "@/components/platform/ui/loading"
import { useLessons } from "@/hooks/use-lessons"

export function ScheduleList() {
  const { data: lessons, isPending } = useLessons()

  return (
    <SectionCard title="Proximas aulas" description="Agenda presencial com data, horario, local e professor.">
      <div className="grid gap-3">
        {isPending && <CardSkeleton />}
        {(lessons ?? []).map((lesson) => (
          <div className="flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center md:justify-between" key={lesson.id}>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-[#0f172b]">{lesson.title}</h2>
                <StatusBadge label={lesson.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(lesson.startsAt).toLocaleDateString("pt-BR")} ·{" "}
                {new Date(lesson.startsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} às{" "}
                {new Date(lesson.endsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
              {(lesson as any).locationName && (
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />{(lesson as any).locationName}
                </p>
              )}
            </div>
          </div>
        ))}
        {!isPending && !(lessons ?? []).length && (
          <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma aula agendada.</p>
        )}
      </div>
    </SectionCard>
  )
}


