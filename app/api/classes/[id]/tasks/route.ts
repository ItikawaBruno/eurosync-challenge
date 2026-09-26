import { NextRequest, NextResponse } from "next/server"
import { requireClassAccess, requireClassManage } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { parseDateOnly } from "@/lib/period"

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/classes/[id]/tasks">) {
  return withApi(async () => {
    const { id } = await ctx.params
    const user = await requireClassAccess(id)

    const [tasks, totalStudents] = await Promise.all([
      prisma.task.findMany({
        where: { classId: id },
        orderBy: { createdAt: "desc" },
        include: { submissions: user.role === "STUDENT" ? { where: { studentId: user.id } } : true },
      }),
      prisma.classStudent.count({ where: { classId: id } }),
    ])

    return NextResponse.json(
      tasks.map((task) => ({
        id: task.id,
        classId: task.classId,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        totalStudents,
        deliveredCount: user.role === "STUDENT" ? undefined : task.submissions.length,
        mySubmission: user.role === "STUDENT" ? task.submissions.length > 0 : undefined,
      })),
    )
  })
}

export async function POST(request: NextRequest, ctx: RouteContext<"/api/classes/[id]/tasks">) {
  return withApi(async () => {
    const { id } = await ctx.params
    await requireClassManage(id)
    const body = await request.json()

    const task = await prisma.task.create({
      data: {
        classId: id,
        title: body.title,
        description: body.description ?? null,
        dueDate: body.dueDate ? parseDateOnly(body.dueDate) : null,
      },
    })

    return NextResponse.json({ ...task, totalStudents: await prisma.classStudent.count({ where: { classId: id } }), deliveredCount: 0 }, { status: 201 })
  })
}
