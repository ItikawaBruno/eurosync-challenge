import { NextRequest, NextResponse } from "next/server"
import { requireUser, requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/lessons/[id]">) {
  return withApi(async () => {
    await requireUser()
    const { id } = await ctx.params

    const lesson = await prisma.lesson.findUniqueOrThrow({
      where: { id },
      include: { class: { select: { id: true, name: true } } },
    })

    return NextResponse.json(lesson)
  })
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/lessons/[id]">) {
  return withApi(async () => {
    await requireRole("ADMIN", "PROFESSOR")
    const { id } = await ctx.params
    const body = await request.json()

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        title: body.title,
        startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
        endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
        status: body.status,
        locationName: body.locationName,
      },
    })

    return NextResponse.json(lesson)
  })
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/lessons/[id]">) {
  return withApi(async () => {
    await requireRole("ADMIN", "PROFESSOR")
    const { id } = await ctx.params
    await prisma.lesson.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  })
}
