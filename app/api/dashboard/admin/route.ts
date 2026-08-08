import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { attendanceRate, monthlyAttendanceSeries } from "@/lib/attendance-stats"

export async function GET() {
  return withApi(async () => {
    await requireRole("ADMIN")

    const [totalStudents, totalClasses, totalLessons, openAlerts, atRiskStudents, attendances] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT", status: "ACTIVE" } }),
      prisma.class.count(),
      prisma.lesson.count(),
      prisma.alert.count({ where: { status: "OPEN" } }),
      prisma.alert.findMany({ where: { status: "OPEN", studentId: { not: null } }, select: { studentId: true }, distinct: ["studentId"] }),
      prisma.attendance.findMany({ include: { lesson: { select: { startsAt: true } } } }),
    ])

    const records = attendances.map((a) => ({ status: a.status, lessonStartsAt: a.lesson.startsAt }))

    return NextResponse.json({
      summary: { students: totalStudents, attendance: attendanceRate(records), classes: totalClasses },
      totalStudents,
      totalClasses,
      averageAttendance: attendanceRate(records),
      studentsAtRisk: atRiskStudents.length,
      monthlyAttendance: monthlyAttendanceSeries(records),
      totalLessons,
      openAlerts,
    })
  })
}
