import { NextRequest, NextResponse } from "next/server"
import { requireUser, requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/classes/[id]">) {
  return withApi(async () => {
    await requireUser()
    const { id } = await ctx.params

    const cls = await prisma.class.findUniqueOrThrow({
      where: { id },
      include: { _count: { select: { students: true, lessons: true } }, teacher: { select: { id: true, name: true } } },
    })

    return NextResponse.json(cls)
  })
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/classes/[id]">) {
  return withApi(async () => {
    await requireRole("ADMIN", "PROFESSOR")
    const { id } = await ctx.params
    const body = await request.json()

    const cls = await prisma.class.update({
      where: { id },
      data: { name: body.name, description: body.description ?? null, teacherId: body.teacherId ?? undefined },
      include: { _count: { select: { students: true, lessons: true } }, teacher: { select: { id: true, name: true } } },
    })

    return NextResponse.json(cls)
  })
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/classes/[id]">) {
  return withApi(async () => {
    await requireRole("ADMIN")
    const { id } = await ctx.params
    await prisma.class.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  })
}
