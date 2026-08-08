import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { attendanceRate, monthlyAttendanceSeries } from "@/lib/attendance-stats"

export async function GET() {
  return withApi(async () => {
    const user = await requireRole("PROFESSOR")

    const classes = await prisma.class.findMany({
      where: { teacherId: user.id },
      select: { id: true, name: true },
    })
    const classIds = classes.map((c) => c.id)

    const [lessonCount, studentCount, openAlerts, atRiskStudents, attendances] = await Promise.all([
      prisma.lesson.count({ where: { classId: { in: classIds } } }),
      prisma.classStudent.findMany({ where: { classId: { in: classIds } }, select: { studentId: true }, distinct: ["studentId"] }),
      prisma.alert.count({ where: { status: "OPEN", classId: { in: classIds } } }),
      prisma.alert.findMany({
        where: { status: "OPEN", classId: { in: classIds }, studentId: { not: null } },
        select: { studentId: true },
        distinct: ["studentId"],
      }),
      prisma.attendance.findMany({
        where: { lesson: { classId: { in: classIds } } },
        include: { lesson: { select: { startsAt: true } } },
      }),
    ])

    const records = attendances.map((a) => ({ status: a.status, lessonStartsAt: a.lesson.startsAt }))

    return NextResponse.json({
      summary: { lessons: lessonCount, students: studentCount.length, alerts: openAlerts },
      attendanceAverage: attendanceRate(records),
      myClasses: classes,
      studentsAtRisk: atRiskStudents.map((s) => ({ id: s.studentId })),
      monthlyAttendance: monthlyAttendanceSeries(records),
    })
  })
}
