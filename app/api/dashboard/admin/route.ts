import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { attendanceRate, monthlyAttendanceSeries, trendInPoints } from "@/lib/attendance-stats"
import { classEngagementSeries } from "@/lib/task-stats"
import { monthRange, parsePeriod } from "@/lib/period"

export async function GET(request: NextRequest) {
  return withApi(async () => {
    await requireRole("ADMIN")

    // Período opcional. Sem parâmetro = desde o início (nada é inventado).
    const period = parsePeriod(request.nextUrl.searchParams)
    const lessonWindow = period ? { startsAt: period } : {}

    const thisMonth = monthRange(0)
    const lastMonth = monthRange(1)

    const [
      totalStudents,
      totalClasses,
      totalLessons,
      openAlerts,
      atRiskStudents,
      attendances,
      studentsThisMonth,
      studentsLastMonth,
      classesForEngagement,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT", status: "ACTIVE" } }),
      prisma.class.count(),
      prisma.lesson.count({ where: lessonWindow }),
      prisma.alert.count({ where: { status: "OPEN" } }),
      prisma.alert.findMany({
        where: { status: "OPEN", studentId: { not: null } },
        select: { studentId: true },
        distinct: ["studentId"],
      }),
      prisma.attendance.findMany({
        where: period ? { lesson: { startsAt: period } } : undefined,
        include: { lesson: { select: { startsAt: true } } },
      }),
      prisma.user.count({
        where: { role: "STUDENT", status: "ACTIVE", createdAt: thisMonth },
      }),
      prisma.user.count({
        where: { role: "STUDENT", status: "ACTIVE", createdAt: lastMonth },
      }),
      prisma.class.findMany({
        select: {
          name: true,
          _count: { select: { students: true } },
          tasks: { select: { _count: { select: { submissions: true } } } },
        },
      }),
    ])

    const records = attendances.map((a) => ({ status: a.status, lessonStartsAt: a.lesson.startsAt }))
    const monthlyAttendance = monthlyAttendanceSeries(records)

    const engagementByClass = classEngagementSeries(
      classesForEngagement.map((klass) => ({
        name: klass.name,
        students: klass._count.students,
        tasks: klass.tasks.map((task) => ({ submissions: task._count.submissions })),
      })),
    )

    return NextResponse.json({
      summary: { students: totalStudents, attendance: attendanceRate(records), classes: totalClasses },
      totalStudents,
      totalClasses,
      averageAttendance: attendanceRate(records),
      studentsAtRisk: atRiskStudents.length,
      monthlyAttendance,
      engagementByClass,
      totalLessons,
      openAlerts,
      // Variações realmente derivadas do banco. Onde não há histórico para
      // comparar, o campo vem null e a UI não desenha tendência nenhuma.
      trends: {
        studentsDelta: studentsThisMonth - studentsLastMonth,
        attendancePp: trendInPoints(monthlyAttendance),
      },
    })
  })
}
