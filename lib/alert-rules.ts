import type { AlertSeverity, AlertType } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { attendanceRate } from "@/lib/attendance-stats"
import { taskDeliveryRate, ADHERENCE_TASK_THRESHOLD, ADHERENCE_ATTENDANCE_THRESHOLD } from "@/lib/task-stats"

export const MIN_LESSONS_FOR_ATTENDANCE_ALERT = 3
export const ABSENCE_SEQUENCE_LENGTH = 3
export const PROGRESS_DROP_POINTS = 20

type Candidate = {
  studentId: string
  classId: string
  type: AlertType
  severity: AlertSeverity
  message: string
}

type LessonAttendance = { status: string; startsAt: Date }

function absenceStreak(records: LessonAttendance[]) {
  let streak = 0
  for (const record of records) {
    if (record.status !== "ABSENT") break
    streak += 1
  }
  return streak
}

function monthRate(records: LessonAttendance[], monthsAgo: number) {
  const reference = new Date()
  reference.setMonth(reference.getMonth() - monthsAgo)
  const scoped = records.filter(
    (r) =>
      r.startsAt.getFullYear() === reference.getFullYear() &&
      r.startsAt.getMonth() === reference.getMonth(),
  )
  return scoped.length === 0 ? null : attendanceRate(scoped)
}

function buildCandidates(input: {
  studentId: string
  studentName: string
  classId: string
  className: string
  attendance: LessonAttendance[]
  tasksDelivered: number
  tasksTotal: number
}): Candidate[] {
  const { studentId, studentName, classId, className, attendance } = input
  const candidates: Candidate[] = []
  const base = { studentId, classId }

  if (attendance.length >= MIN_LESSONS_FOR_ATTENDANCE_ALERT) {
    const rate = attendanceRate(attendance)
    if (rate < ADHERENCE_ATTENDANCE_THRESHOLD) {
      candidates.push({
        ...base,
        type: "LOW_ATTENDANCE",
        severity: rate < 50 ? "HIGH" : "MEDIUM",
        message: `${studentName} está com ${rate}% de frequência em ${className}, abaixo do mínimo de ${ADHERENCE_ATTENDANCE_THRESHOLD}%.`,
      })
    }
  }

  const streak = absenceStreak(attendance)
  if (streak >= ABSENCE_SEQUENCE_LENGTH) {
    candidates.push({
      ...base,
      type: "ABSENCE_SEQUENCE",
      severity: "HIGH",
      message: `${studentName} acumula ${streak} faltas consecutivas em ${className}.`,
    })
  }

  if (input.tasksTotal > 0) {
    const rate = taskDeliveryRate(input.tasksDelivered, input.tasksTotal)
    if (rate < ADHERENCE_TASK_THRESHOLD) {
      candidates.push({
        ...base,
        type: "LOW_ENGAGEMENT",
        severity: rate < 50 ? "HIGH" : "MEDIUM",
        message: `${studentName} entregou ${input.tasksDelivered} de ${input.tasksTotal} tarefas em ${className} (${rate}%).`,
      })
    }
  }

  const current = monthRate(attendance, 0)
  const previous = monthRate(attendance, 1)
  if (current !== null && previous !== null && previous - current >= PROGRESS_DROP_POINTS) {
    candidates.push({
      ...base,
      type: "DROPPING_PROGRESS",
      severity: "MEDIUM",
      message: `A frequência de ${studentName} em ${className} caiu de ${previous}% para ${current}% no último mês.`,
    })
  }

  return candidates
}

const MANAGED_TYPES: AlertType[] = [
  "LOW_ATTENDANCE",
  "ABSENCE_SEQUENCE",
  "LOW_ENGAGEMENT",
  "DROPPING_PROGRESS",
]

const key = (c: { studentId: string; classId: string; type: AlertType }) =>
  `${c.classId}:${c.studentId}:${c.type}`

export async function generateAlerts(classIds: string[]) {
  if (classIds.length === 0) return { created: 0, resolved: 0, evaluated: 0 }

  const classes = await prisma.class.findMany({
    where: { id: { in: classIds } },
    select: {
      id: true,
      name: true,
      students: { select: { student: { select: { id: true, name: true } } } },
      lessons: {
        select: { id: true, startsAt: true, attendances: { select: { studentId: true, status: true } } },
        orderBy: { startsAt: "desc" },
      },
      tasks: { select: { id: true, submissions: { select: { studentId: true } } } },
    },
  })

  const candidates: Candidate[] = []

  for (const klass of classes) {
    for (const { student } of klass.students) {
      const attendance: LessonAttendance[] = []
      for (const lesson of klass.lessons) {
        const record = lesson.attendances.find((a) => a.studentId === student.id)
        if (record) attendance.push({ status: record.status, startsAt: lesson.startsAt })
      }

      candidates.push(
        ...buildCandidates({
          studentId: student.id,
          studentName: student.name,
          classId: klass.id,
          className: klass.name,
          attendance,
          tasksDelivered: klass.tasks.filter((t) => t.submissions.some((s) => s.studentId === student.id)).length,
          tasksTotal: klass.tasks.length,
        }),
      )
    }
  }

  const openAlerts = await prisma.alert.findMany({
    where: { status: "OPEN", classId: { in: classIds }, type: { in: MANAGED_TYPES } },
    select: { id: true, studentId: true, classId: true, type: true },
  })

  const openKeys = new Set(
    openAlerts
      .filter((a) => a.studentId && a.classId)
      .map((a) => key({ studentId: a.studentId!, classId: a.classId!, type: a.type })),
  )
  const candidateKeys = new Set(candidates.map(key))

  const toCreate = candidates.filter((c) => !openKeys.has(key(c)))
  const toResolve = openAlerts.filter(
    (a) => a.studentId && a.classId && !candidateKeys.has(key({ studentId: a.studentId, classId: a.classId, type: a.type })),
  )

  const [created, resolved] = await prisma.$transaction([
    prisma.alert.createMany({ data: toCreate }),
    prisma.alert.updateMany({
      where: { id: { in: toResolve.map((a) => a.id) } },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    }),
  ])

  return { created: created.count, resolved: resolved.count, evaluated: classes.length }
}

export async function generateAlertsForUser(user: { id: string; role: string }) {
  const classes = await prisma.class.findMany({
    where: user.role === "PROFESSOR" ? { teacherId: user.id } : {},
    select: { id: true },
  })
  return generateAlerts(classes.map((c) => c.id))
}
