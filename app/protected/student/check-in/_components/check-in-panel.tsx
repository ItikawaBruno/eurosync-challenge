"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, MapPin, QrCode, AlertCircle } from "lucide-react"
import { Button } from "@/components/platform/ui/button"
import { SectionCard } from "@/components/platform/ui/card"
import { Input } from "@/components/platform/ui/forms"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { AppModal, useOverlayState } from "@/components/platform/ui/app-modal"
import { useLessons } from "@/hooks/use-lessons"
import { useCheckIn } from "@/hooks/use-attendance"

export function CheckInPanel() {
  const { data: lessons } = useLessons()
  const checkIn = useCheckIn()
  const confirmModal = useOverlayState()
  const qrcodeModal = useOverlayState()
  
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [locationAvailable, setLocationAvailable] = useState(false)
  const [qrCodeToken, setQrCodeToken] = useState("")
  const [checkinMethod, setCheckinMethod] = useState<"LOCATION" | "QR_CODE">("LOCATION")

  const openLesson = (lessons ?? []).find((l) => l.status === "OPEN") ?? lessons?.[0]
  const checkInError = checkIn.error?.message ?? null

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude)
          setLongitude(position.coords.longitude)
          setLocationAvailable(true)
        },
        (error) => {
          console.error("Erro ao obter localização:", error)
          setLocationAvailable(false)
        },
      )
    }
  }, [])

  const handleConfirmLocation = () => {
    if (!openLesson || !latitude || !longitude) return
    checkIn.reset()
    checkIn.mutate(
      {
        lessonId: openLesson.id,
        checkinMethod: "LOCATION",
        latitude,
        longitude,
      },
      { onSuccess: () => confirmModal.close() },
    )
  }

  const handleConfirmQRCode = () => {
    if (!openLesson || !qrCodeToken.trim()) return
    checkIn.reset()
    checkIn.mutate(
      {
        lessonId: openLesson.id,
        checkinMethod: "QR_CODE",
        qrCodeToken,
      },
      { onSuccess: () => { setQrCodeToken(""); qrcodeModal.close() } },
    )
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <SectionCard title="Aula ativa" description={openLesson ? `${openLesson.title} · ${(openLesson as any).locationName ?? ""}` : "Nenhuma aula ativa"}>
          <div className="grid gap-4">
            {openLesson ? (
              <>
                {locationAvailable ? (
                  <div className="rounded-xl border bg-green-50 p-4 text-green-800">
                    <CheckCircle2 className="mb-2 h-5 w-5" />
                    Localizacao capturada. A distancia ate o local da aula sera validada na confirmacao.
                  </div>
                ) : (
                  <div className="rounded-xl border bg-amber-50 p-4 text-amber-800">
                    <AlertCircle className="mb-2 h-5 w-5" />
                    Localizacao nao disponivel. Use o QR Code.
                  </div>
                )}
                <div className="grid gap-2 md:grid-cols-2">
                  <Button
                    className="w-full"
                    variant={locationAvailable ? "accent" : "outline"}
                    onClick={confirmModal.open}
                    disabled={!locationAvailable}
                  >
                    <MapPin className="h-4 w-4" />
                    Confirmar por localizacao
                  </Button>
                  <Button className="w-full" variant="outline" onClick={qrcodeModal.open}>
                    <QrCode className="h-4 w-4" />
                    Confirmar por QR Code
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border p-4">
                    <MapPin className="h-5 w-5 text-primary" />
                    <p className="mt-2 font-medium text-gray-800">Localizacao {locationAvailable ? "validada" : "nao disponivel"}</p>
                    <p className="text-sm text-muted-foreground">
                      {locationAvailable ? `${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}` : "Ative a localização no dispositivo"}
                    </p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <StatusBadge label={openLesson.status === "OPEN" ? "Chamada ativa" : "Chamada encerrada"} />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Encerra as {new Date(openLesson.endsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma aula com chamada aberta no momento.</p>
            )}
          </div>
        </SectionCard>
        <SectionCard title="QR Code da aula" description="Use o codigo exibido pelo professor quando solicitado.">
          <div className="grid place-items-center rounded-2xl border bg-slate-50 p-8">
            <div className="grid h-56 w-56 place-items-center rounded-2xl border-2 border-dashed bg-white text-primary">
              <QrCode className="h-24 w-24" />
            </div>
          </div>
        </SectionCard>
      </div>

      <AppModal
        state={confirmModal}
        title="Confirmar presenca por localização"
        footer={
          <>
            <Button variant="outline" onClick={confirmModal.close}>Cancelar</Button>
            <Button variant="accent" onClick={handleConfirmLocation} disabled={checkIn.isPending || !locationAvailable}>
              Confirmar
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Voce esta confirmando presenca em <strong>{openLesson?.title}</strong> usando sua localização.
          </p>
          {checkInError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{checkInError}</div>
          )}
          {latitude && longitude && (
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-medium text-muted-foreground">Coordenadas capturadas:</p>
              <p className="mt-1 text-sm font-mono">{latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Esta acao nao pode ser desfeita.</p>
        </div>
      </AppModal>

      <AppModal
        state={qrcodeModal}
        title="Confirmar presenca por QR Code"
        footer={
          <>
            <Button variant="outline" onClick={qrcodeModal.close}>Cancelar</Button>
            <Button variant="accent" onClick={handleConfirmQRCode} disabled={checkIn.isPending || !qrCodeToken.trim()}>
              Confirmar
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Digite o codigo QR exibido pelo professor para <strong>{openLesson?.title}</strong>.
          </p>
          {checkInError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{checkInError}</div>
          )}
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Codigo QR</span>
            <Input
              required
              placeholder="Escaneie ou digite o codigo aqui"
              value={qrCodeToken}
              onChange={(e) => setQrCodeToken(e.target.value)}
              autoFocus
            />
          </label>
          <p className="text-xs text-muted-foreground">Esta acao nao pode ser desfeita.</p>
        </div>
      </AppModal>
    </>
  )
}

