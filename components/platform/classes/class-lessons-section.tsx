"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Trash2, MapPin } from "lucide-react"
import { SectionCard } from "@/components/platform/ui/card"
import { Button } from "@/components/platform/ui/button"
import { Input } from "@/components/platform/ui/forms"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { CardSkeleton } from "@/components/platform/ui/loading"
import { AppModal, useOverlayState } from "@/components/platform/ui/app-modal"
import { useLessons, useCreateLesson, useDeleteLesson } from "@/hooks/use-lessons"

const DEFAULT_RADIUS_M = 150

export function ClassLessonsSection({ classId }: { classId: string }) {
  const { data: lessons, isPending } = useLessons(classId)
  const createLesson = useCreateLesson()
  const deleteLesson = useDeleteLesson()
  const modal = useOverlayState()

  const [title, setTitle] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [locationName, setLocationName] = useState("")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [radius, setRadius] = useState(String(DEFAULT_RADIUS_M))
  const [error, setError] = useState<string | null>(null)

  const captureLocation = () => {
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => setCoords({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => setError("Não foi possível obter a localização deste dispositivo."),
    )
  }

  const handleCreate = () => {
    if (!title.trim() || !startsAt || !endsAt) {
      setError("Preencha título, início e término.")
      return
    }
    setError(null)
    createLesson.mutate(
      {
        classId,
        title: title.trim(),
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        locationName: locationName.trim() || undefined,
        locationLat: coords?.lat ?? null,
        locationLng: coords?.lng ?? null,
        locationRadiusM: coords ? Number(radius) || DEFAULT_RADIUS_M : null,
      },
      {
        onSuccess: () => {
          setTitle("")
          setStartsAt("")
          setEndsAt("")
          setLocationName("")
          setCoords(null)
          setRadius(String(DEFAULT_RADIUS_M))
          modal.close()
        },
      },
    )
  }

  return (
    <>
      <SectionCard
        title="Aulas"
        description="Agende encontros e conduza a chamada presencial."
        action={
          <Button size="sm" variant="accent" onClick={modal.open}>
            <Plus className="mr-1 h-4 w-4" />
            Nova aula
          </Button>
        }
      >
        {isPending ? (
          <CardSkeleton />
        ) : (
          <div className="grid gap-3">
            {(lessons ?? []).map((lesson) => (
              <div key={lesson.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                <div>
                  <p className="font-medium">{lesson.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(lesson.startsAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    {lesson.locationName ? ` · ${lesson.locationName}` : ""}
                  </p>
                  {lesson.locationLat != null && (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      Check-in por localização em até {lesson.locationRadiusM ?? DEFAULT_RADIUS_M}m
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge
                    label={lesson.status === "OPEN" ? "Chamada aberta" : "Chamada encerrada"}
                    tone={lesson.status === "OPEN" ? "success" : "default"}
                  />
                  <Link
                    href={`/professor/lessons/${lesson.id}/attendance`}
                    className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Chamada
                  </Link>
                  <button
                    aria-label={`Excluir aula ${lesson.title}`}
                    className="rounded-lg border p-1.5 text-rose-600 hover:bg-rose-50"
                    onClick={() => deleteLesson.mutate(lesson.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {!lessons?.length && <p className="text-sm text-muted-foreground">Nenhuma aula agendada ainda.</p>}
          </div>
        )}
      </SectionCard>

      <AppModal
        state={modal}
        title="Nova aula"
        footer={
          <>
            <Button variant="outline" onClick={modal.close}>Cancelar</Button>
            <Button variant="accent" onClick={handleCreate} disabled={createLesson.isPending}>Criar</Button>
          </>
        }
      >
        <div className="grid gap-3">
          {error && <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Título</span>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Início</span>
              <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Término</span>
              <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </label>
          </div>
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Local</span>
            <Input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="Sala 204" />
          </label>
          <div className="rounded-xl border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Check-in por localização</p>
              <Button size="sm" variant="outline" onClick={captureLocation}>
                <MapPin className="mr-1 h-4 w-4" />
                Usar minha posição
              </Button>
            </div>
            {coords ? (
              <>
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                </p>
                <label className="mt-2 grid gap-2 text-sm">
                  <span className="font-medium">Raio permitido (metros)</span>
                  <Input type="number" min={10} value={radius} onChange={(e) => setRadius(e.target.value)} />
                </label>
              </>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Sem coordenadas, os alunos só poderão confirmar presença pelo código QR.
              </p>
            )}
          </div>
        </div>
      </AppModal>
    </>
  )
}
