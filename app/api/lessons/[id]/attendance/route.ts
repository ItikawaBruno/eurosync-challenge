import { NextRequest, NextResponse } from "next/server"
import { requireLessonManage } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { lessonRoster } from "@/lib/attendance-roster"

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/lessons/[id]/attendance">) {
  return withApi(async () => {
    const { id } = await ctx.params
    await requireLessonManage(id)

    return NextResponse.json(await lessonRoster(id))
  })
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/lessons/[id]/attendance">) {
  return withApi(async () => {
    const { id } = await ctx.params
    const { lesson } = await requireLessonManage(id)
    const body = await request.json()

    const enrolled = await prisma.classStudent.findUnique({
      where: { classId_studentId: { classId: lesson.classId, studentId: body.studentId } },
    })
    if (!enrolled) {
      return NextResponse.json({ error: "Aluno não está matriculado nesta turma." }, { status: 400 })
    }

    const attendance = await prisma.attendance.upsert({
      where: { lessonId_studentId: { lessonId: id, studentId: body.studentId } },
      update: { status: body.status },
      create: { lessonId: id, studentId: body.studentId, status: body.status },
      include: { student: { select: { id: true, name: true } } },
    })

    return NextResponse.json(attendance)
  })
}
