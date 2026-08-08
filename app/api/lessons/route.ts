import { NextRequest, NextResponse } from "next/server"
import { requireUser, requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  return withApi(async () => {
    const user = await requireUser()
    const classId = request.nextUrl.searchParams.get("classId")

    const classFilter =
      user.role === "PROFESSOR"
        ? { teacherId: user.id }
        : user.role === "STUDENT"
          ? { students: { some: { studentId: user.id } } }
          : undefined

    const lessons = await prisma.lesson.findMany({
      where: {
        ...(classId ? { classId } : {}),
        ...(classFilter ? { class: classFilter } : {}),
      },
      orderBy: { startsAt: "desc" },
      include: { class: { select: { id: true, name: true } } },
    })

    return NextResponse.json(lessons)
  })
}

export async function POST(request: NextRequest) {
  return withApi(async () => {
    await requireRole("ADMIN", "PROFESSOR")
    const body = await request.json()

    const lesson = await prisma.lesson.create({
      data: {
        classId: body.classId,
        title: body.title,
        startsAt: new Date(body.startsAt),
        endsAt: new Date(body.endsAt),
        locationName: body.locationName ?? null,
      },
    })

    return NextResponse.json(lesson, { status: 201 })
  })
}
