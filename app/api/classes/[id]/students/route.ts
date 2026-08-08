import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, ctx: RouteContext<"/api/classes/[id]/students">) {
  return withApi(async () => {
    await requireRole("ADMIN", "PROFESSOR")
    const { id } = await ctx.params
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
