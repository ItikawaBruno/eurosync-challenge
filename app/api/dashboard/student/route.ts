import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { attendanceRate } from "@/lib/attendance-stats"

export async function GET() {
  return withApi(async () => {
    const user = await requireRole("STUDENT")

    const enrollments = await prisma.classStudent.findMany({
      where: { studentId: user.id },
      select: { classId: true },
    })
    const classIds = enrollments.map((e) => e.classId)

    const [attendances, lessonCount, nextLesson] = await Promise.all([
      prisma.attendance.findMany({ where: { studentId: user.id } }),
      prisma.lesson.count({ where: { classId: { in: classIds } } }),
      prisma.lesson.findFirst({
        where: { classId: { in: classIds }, startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
      }),
    ])

    const rate = attendanceRate(attendances)
    const present = attendances.filter((a) => a.status === "PRESENT").length

    return NextResponse.json({
      summary: {
        attendance: rate,
        lessons: lessonCount,
        nextLesson: nextLesson?.title ?? null,
      },
      attendance: { rate, present, total: attendances.length },
      nextLesson: nextLesson ? { title: nextLesson.title, startsAt: nextLesson.startsAt } : null,
    })
  })
}
