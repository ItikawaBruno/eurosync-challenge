import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { distanceInMeters, DEFAULT_CHECKIN_RADIUS_M } from "@/lib/geo"

const LATE_TOLERANCE_MINUTES = 10

export async function POST(request: NextRequest) {
  return withApi(async () => {
    const user = await requireRole("STUDENT")
    const body = await request.json()
    const { lessonId, checkinMethod, latitude, longitude, qrCodeToken } = body

    const lesson = await prisma.lesson.findUniqueOrThrow({ where: { id: lessonId } })

    const enrolled = await prisma.classStudent.findUnique({
      where: { classId_studentId: { classId: lesson.classId, studentId: user.id } },
    })
    if (!enrolled) {
      return NextResponse.json({ error: "Você não está matriculado nesta turma." }, { status: 403 })
    }

    if (lesson.status !== "OPEN") {
      return NextResponse.json({ error: "A chamada desta aula está encerrada." }, { status: 400 })
    }

    const now = new Date()
    if (now > lesson.endsAt) {
      return NextResponse.json({ error: "A aula já terminou." }, { status: 400 })
    }

    if (checkinMethod === "QR_CODE") {
      if (!qrCodeToken || qrCodeToken.trim().toUpperCase() !== lesson.qrCodeToken) {
        return NextResponse.json({ error: "Código QR inválido." }, { status: 400 })
      }
    } else if (checkinMethod === "LOCATION") {
      if (typeof latitude !== "number" || typeof longitude !== "number") {
        return NextResponse.json({ error: "Localização não informada." }, { status: 400 })
      }
      if (lesson.locationLat == null || lesson.locationLng == null) {
        return NextResponse.json(
          { error: "Esta aula não tem local definido. Use o código QR." },
          { status: 400 },
        )
      }

      const radius = lesson.locationRadiusM ?? DEFAULT_CHECKIN_RADIUS_M
      const distance = distanceInMeters(
        { lat: latitude, lng: longitude },
        { lat: lesson.locationLat, lng: lesson.locationLng },
      )
      if (distance > radius) {
        return NextResponse.json(
          { error: `Você está a ${distance}m do local da aula (limite de ${radius}m).` },
          { status: 400 },
        )
      }
    } else {
      return NextResponse.json({ error: "Método de check-in inválido." }, { status: 400 })
    }

    const toleranceLimit = new Date(lesson.startsAt.getTime() + LATE_TOLERANCE_MINUTES * 60_000)
    const status = now > toleranceLimit ? "LATE" : "PRESENT"

    const attendance = await prisma.attendance.upsert({
      where: { lessonId_studentId: { lessonId, studentId: user.id } },
      update: {
        status,
        checkinMethod,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        checkedInAt: now,
      },
      create: {
        lessonId,
        studentId: user.id,
        status,
        checkinMethod,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        checkedInAt: now,
      },
    })

    return NextResponse.json(attendance, { status: 201 })
  })
}
