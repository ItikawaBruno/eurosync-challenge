import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/lessons/[id]/attendance">) {
  return withApi(async () => {
    await requireRole("ADMIN", "PROFESSOR")
    const { id } = await ctx.params

    const attendance = await prisma.attendance.findMany({
      where: { lessonId: id },
      include: { student: { select: { id: true, name: true } } },
      orderBy: { student: { name: "asc" } },
    })

    return NextResponse.json(attendance)
  })
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/lessons/[id]/attendance">) {
  return withApi(async () => {
    await requireRole("ADMIN", "PROFESSOR")
    const { id } = await ctx.params
    const body = await request.json()

    const attendance = await prisma.attendance.upsert({
      where: { lessonId_studentId: { lessonId: id, studentId: body.studentId } },
      update: { status: body.status },
      create: { lessonId: id, studentId: body.studentId, status: body.status },
      include: { student: { select: { id: true, name: true } } },
    })

    return NextResponse.json(attendance)
  })
}
