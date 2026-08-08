import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function POST(_request: NextRequest, ctx: RouteContext<"/api/tasks/[id]/submit">) {
  return withApi(async () => {
    const { id } = await ctx.params
    const user = await requireRole("STUDENT")

    const task = await prisma.task.findUniqueOrThrow({ where: { id } })
    const enrolled = await prisma.classStudent.findUnique({
      where: { classId_studentId: { classId: task.classId, studentId: user.id } },
    })
    if (!enrolled) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const submission = await prisma.taskSubmission.upsert({
      where: { taskId_studentId: { taskId: id, studentId: user.id } },
      update: {},
      create: { taskId: id, studentId: user.id },
    })

    return NextResponse.json(submission, { status: 201 })
  })
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/tasks/[id]/submit">) {
  return withApi(async () => {
    const { id } = await ctx.params
    const user = await requireRole("STUDENT")

    await prisma.taskSubmission.deleteMany({ where: { taskId: id, studentId: user.id } })
    return NextResponse.json({ ok: true })
  })
}
