import { NextRequest, NextResponse } from "next/server"
import { requireClassAccess, requireClassManage } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/classes/[id]/students">) {
  return withApi(async () => {
    const { id } = await ctx.params
    await requireClassAccess(id)

    const enrollments = await prisma.classStudent.findMany({
      where: { classId: id },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { student: { name: "asc" } },
    })

    return NextResponse.json(enrollments.map((e) => ({ ...e.student, enrolledAt: e.enrolledAt })))
  })
}

export async function POST(request: NextRequest, ctx: RouteContext<"/api/classes/[id]/students">) {
  return withApi(async () => {
    const { id } = await ctx.params
    await requireClassManage(id)
    const body = await request.json()
    const studentIds: string[] = body.studentIds ?? []

    await prisma.classStudent.createMany({
      data: studentIds.map((studentId) => ({ classId: id, studentId })),
      skipDuplicates: true,
    })

    const cls = await prisma.class.findUniqueOrThrow({
      where: { id },
      include: { _count: { select: { students: true, lessons: true } } },
    })

    return NextResponse.json(cls)
  })
}
