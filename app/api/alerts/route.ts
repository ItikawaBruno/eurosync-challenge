import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth-server"
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
