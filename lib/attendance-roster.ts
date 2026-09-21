import { prisma } from "@/lib/prisma"

export async function lessonRoster(lessonId: string) {
  const lesson = await prisma.lesson.findUniqueOrThrow({
    where: { id: lessonId },
    select: {
      id: true,
      class: { select: { students: { select: { student: { select: { id: true, name: true } } } } } },
      attendances: { select: { id: true, studentId: true, status: true, checkinMethod: true, checkedInAt: true } },
    },
  })

  return lesson.class.students
    .map(({ student }) => {
      const record = lesson.attendances.find((a) => a.studentId === student.id)
      return {
        id: record?.id ?? `pending:${student.id}`,
        student,
        status: record?.status ?? "PENDING",
        checkinMethod: record?.checkinMethod ?? null,
        checkedInAt: record?.checkedInAt ?? null,
      }
    })
    .sort((a, b) => a.student.name.localeCompare(b.student.name, "pt-BR"))
}

export async function closeLessonRoster(lessonId: string) {
  const lesson = await prisma.lesson.findUniqueOrThrow({
    where: { id: lessonId },
    select: {
      class: { select: { students: { select: { studentId: true } } } },
      attendances: { select: { studentId: true } },
    },
  })

  const registered = new Set(lesson.attendances.map((a) => a.studentId))
  const missing = lesson.class.students
    .map((s) => s.studentId)
    .filter((studentId) => !registered.has(studentId))

  if (missing.length === 0) return { markedAbsent: 0 }

  const result = await prisma.attendance.createMany({
    data: missing.map((studentId) => ({ lessonId, studentId, status: "ABSENT" as const })),
    skipDuplicates: true,
  })

  return { markedAbsent: result.count }
}
