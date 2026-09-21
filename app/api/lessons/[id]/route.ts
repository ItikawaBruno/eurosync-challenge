import { NextRequest, NextResponse } from "next/server"
import { requireUser, requireLessonManage } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { closeLessonRoster } from "@/lib/attendance-roster"
import { generateAlerts } from "@/lib/alert-rules"
import { DEFAULT_CHECKIN_RADIUS_M } from "@/lib/geo"

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/lessons/[id]">) {
  return withApi(async () => {
    const user = await requireUser()
    const { id } = await ctx.params

    const lesson = await prisma.lesson.findUniqueOrThrow({
      where: { id },
      include: { class: { select: { id: true, name: true } } },
    })

    if (user.role === "STUDENT" || user.role === "PARENT") {
      const { qrCodeToken: _token, ...visible } = lesson
      return NextResponse.json(visible)
    }

    return NextResponse.json(lesson)
  })
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/lessons/[id]">) {
  return withApi(async () => {
    const { id } = await ctx.params
    await requireLessonManage(id)
    const body = await request.json()

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        title: body.title,
        startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
        endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
        status: body.status,
        locationName: body.locationName,
        locationLat: body.locationLat,
        locationLng: body.locationLng,
        locationRadiusM:
          body.locationRadiusM ?? (body.locationLat != null ? DEFAULT_CHECKIN_RADIUS_M : undefined),
      },
    })

    // Fechar a chamada consolida a lista: quem não confirmou presença vira falta.
    if (body.status === "CLOSED") {
      await closeLessonRoster(lesson.id)
      await generateAlerts([lesson.classId])
    }

    return NextResponse.json(lesson)
  })
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/lessons/[id]">) {
  return withApi(async () => {
    const { id } = await ctx.params
    await requireLessonManage(id)
    await prisma.lesson.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  })
}
