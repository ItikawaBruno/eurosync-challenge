import { NextRequest, NextResponse } from "next/server"
import { requireClassAccess } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { attendanceRate } from "@/lib/attendance-stats"
import { taskDeliveryRate, isAdherent, monthlySubmissionSeries } from "@/lib/task-stats"

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/classes/[id]/metrics">) {
  return withApi(async () => {
    const { id } = await ctx.params
    await requireClassAccess(id)

    const [classStudents, tasks, lessons] = await Promise.all([
      prisma.classStudent.findMany({ where: { classId: id }, include: { student: true } }),
      prisma.task.findMany({ where: { classId: id }, include: { submissions: true } }),
      prisma.lesson.findMany({ where: { classId: id }, select: { id: true } }),
    ])

    const attendances = await prisma.attendance.findMany({
      where: { lessonId: { in: lessons.map((l) => l.id) } },
    })

    const totalTasks = tasks.length

    const students = classStudents.map(({ student }) => {
      const delivered = tasks.filter((t) => t.submissions.some((s) => s.studentId === student.id)).length
      const taskRate = taskDeliveryRate(delivered, totalTasks)
      const studentRate = attendanceRate(attendances.filter((a) => a.studentId === student.id))

      return {
        id: student.id,
        name: student.name,
        tasksDelivered: delivered,
        tasksTotal: totalTasks,
        taskRate,
        attendanceRate: studentRate,
        adherent: isAdherent(taskRate, studentRate),
      }
    })

    const taskStats = tasks.map((task) => ({
      taskId: task.id,
      title: task.title,
      delivered: task.submissions.length,
      total: classStudents.length,
      pending: classStudents.length - task.submissions.length,
    }))

    const evolution = monthlySubmissionSeries(tasks.flatMap((t) => t.submissions))

    return NextResponse.json({
      totalStudents: classStudents.length,
      totalTasks,
      taskStats,
      students,
      evolution,
    })
  })
}
