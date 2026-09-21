import { NextRequest, NextResponse } from "next/server"
import { requireUser, requireRole, requireClassManage } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function GET() {
  return withApi(async () => {
    const user = await requireUser()

    const where =
      user.role === "STUDENT"
        ? { studentId: user.id }
        : user.role === "PROFESSOR"
          ? { class: { teacherId: user.id } }
          : undefined

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { name: true } },
        class: { select: { name: true } },
      },
    })

    return NextResponse.json(alerts)
  })
}

export async function POST(request: NextRequest) {
  return withApi(async () => {
    await requireRole("ADMIN", "PROFESSOR")
    const body = await request.json()

    if (!body.message?.trim()) {
      return NextResponse.json({ error: "Mensagem é obrigatória." }, { status: 400 })
    }
    if (body.classId) await requireClassManage(body.classId)

    const alert = await prisma.alert.create({
      data: {
        type: body.type,
        severity: body.severity,
        message: body.message.trim(),
        studentId: body.studentId ?? null,
        classId: body.classId ?? null,
      },
      include: {
        student: { select: { name: true } },
        class: { select: { name: true } },
      },
    })

    return NextResponse.json(alert, { status: 201 })
  })
}
