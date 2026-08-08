import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { ForbiddenError } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  return withApi(async () => {
    const user = await requireUser()
    const studentId = request.nextUrl.searchParams.get("studentId") ?? user.id

    if (user.role === "STUDENT" && studentId !== user.id) {
      throw new ForbiddenError()
    }

    const attendance = await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      include: { lesson: { select: { id: true, title: true, startsAt: true } } },
    })

    return NextResponse.json(
      attendance.map((a) => ({
        id: a.id,
        status: a.status,
        date: a.lesson.startsAt,
        lesson: a.lesson,
      })),
    )
  })
}
