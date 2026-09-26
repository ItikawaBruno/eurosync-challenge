import { NextRequest, NextResponse } from "next/server"
import { requireUser, requireClassManage } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { createQrCodeToken } from "@/lib/lesson-token"
import { DEFAULT_CHECKIN_RADIUS_M } from "@/lib/geo"

export async function GET(request: NextRequest) {
  return withApi(async () => {
    const user = await requireUser()
    const params = request.nextUrl.searchParams
    const classId = params.get("classId")

    // "Próximas aulas" precisa ser de verdade: sem isto a listagem devolvia as
    // aulas mais recentes do passado (orderBy desc, sem corte de data).
    const upcoming = params.get("upcoming") === "true"
    const days = Number(params.get("days"))
    const hasWindow = upcoming && Number.isInteger(days) && days > 0

    const windowEnd = new Date()
    windowEnd.setDate(windowEnd.getDate() + days)

    const classFilter =
      user.role === "PROFESSOR"
        ? { teacherId: user.id }
        : user.role === "STUDENT"
          ? { students: { some: { studentId: user.id } } }
          : undefined

    const lessons = await prisma.lesson.findMany({
      where: {
        ...(classId ? { classId } : {}),
        ...(classFilter ? { class: classFilter } : {}),
        ...(upcoming
          ? { startsAt: hasWindow ? { gte: new Date(), lte: windowEnd } : { gte: new Date() } }
          : {}),
      },
      orderBy: { startsAt: upcoming ? "asc" : "desc" },
      include: { class: { select: { id: true, name: true } } },
    })

    // O token do QR é o segredo da chamada: só quem conduz a aula pode vê-lo.
    if (user.role === "STUDENT" || user.role === "PARENT") {
      return NextResponse.json(lessons.map(({ qrCodeToken: _token, ...lesson }) => lesson))
    }

    return NextResponse.json(lessons)
  })
}

export async function POST(request: NextRequest) {
  return withApi(async () => {
    const body = await request.json()
    await requireClassManage(body.classId)

    const startsAt = new Date(body.startsAt)
    const endsAt = new Date(body.endsAt)
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
      return NextResponse.json({ error: "Horário da aula inválido." }, { status: 400 })
    }

    const lesson = await prisma.lesson.create({
      data: {
        classId: body.classId,
        title: body.title,
        startsAt,
        endsAt,
        locationName: body.locationName ?? null,
        locationLat: body.locationLat ?? null,
        locationLng: body.locationLng ?? null,
        locationRadiusM: body.locationLat != null ? (body.locationRadiusM ?? DEFAULT_CHECKIN_RADIUS_M) : null,
        qrCodeToken: createQrCodeToken(),
      },
    })

    return NextResponse.json(lesson, { status: 201 })
  })
}
