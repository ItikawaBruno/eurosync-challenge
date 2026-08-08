import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  return withApi(async () => {
    const user = await requireRole("STUDENT")
    const body = await request.json()
    const { lessonId, checkinMethod, latitude, longitude, qrCodeToken } = body

    const lesson = await prisma.lesson.findUniqueOrThrow({ where: { id: lessonId } })

    if (checkinMethod === "QR_CODE") {
      if (!qrCodeToken || qrCodeToken !== lesson.qrCodeToken) {
        return NextResponse.json({ error: "Código QR inválido." }, { status: 400 })
      }
    }

    const attendance = await prisma.attendance.upsert({
      where: { lessonId_studentId: { lessonId, studentId: user.id } },
      update: {
        status: "PRESENT",
        checkinMethod,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        checkedInAt: new Date(),
      },
      create: {
        lessonId,
        studentId: user.id,
        status: "PRESENT",
        checkinMethod,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        checkedInAt: new Date(),
      },
    })

    return NextResponse.json(attendance, { status: 201 })
  })
}
