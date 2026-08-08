import { NextRequest, NextResponse } from "next/server"
import { requireClassManage } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/tasks/[id]">) {
  return withApi(async () => {
    const { id } = await ctx.params
    const existing = await prisma.task.findUniqueOrThrow({ where: { id } })
    await requireClassManage(existing.classId)
    const body = await request.json()

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: body.title ?? undefined,
        description: body.description ?? null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    })

    return NextResponse.json(task)
  })
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/tasks/[id]">) {
  return withApi(async () => {
    const { id } = await ctx.params
    const existing = await prisma.task.findUniqueOrThrow({ where: { id } })
    await requireClassManage(existing.classId)

    await prisma.task.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  })
}
