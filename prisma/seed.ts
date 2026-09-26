import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

/**
 * Este seed grava dados de DEMONSTRAÇÃO (alunos fictícios, aulas, presenças,
 * registros de LMS). Rodá-lo num banco real enche a aplicação de dados falsos,
 * indistinguíveis de dados de produção nas telas.
 *
 * Por isso ele só roda contra host local. Para qualquer outro host é preciso
 * dizer explicitamente que a intenção é essa:
 *   ALLOW_REMOTE_SEED=1 npx tsx --env-file=.env prisma/seed.ts
 */
function assertSeedIsAllowed() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL não definido.")

  let host: string
  try {
    host = new URL(url).hostname
  } catch {
    throw new Error("DATABASE_URL inválido — não foi possível ler o host.")
  }

  const isLocal = ["localhost", "127.0.0.1", "::1", "db", "postgres"].includes(host)
  if (isLocal || process.env.ALLOW_REMOTE_SEED === "1") return

  throw new Error(
    `Seed bloqueado: "${host}" nao e um banco local.\n` +
      "Este seed insere dados de demonstracao e nao deve rodar em banco real.\n" +
      "Se for realmente a intencao, rode com ALLOW_REMOTE_SEED=1.",
  )
}

const LMS_ENTITIES = [
  "COURSES",
  "CLASSES",
  "STUDENTS",
  "PROFESSORS",
  "ENROLLMENTS",
  "PROGRESS",
  "ATTENDANCE",
  "ACTIVITIES",
  "GRADES",
  "COMPLETIONS",
] as const

async function main() {
  assertSeedIsAllowed()

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@euro-sync.com"

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { name: "Admin", email: adminEmail, role: "ADMIN", status: "ACTIVE" },
  })

  const professor = await prisma.user.upsert({
    where: { email: "professor@euro-sync.com" },
    update: {},
    create: { name: "Carla Souza", email: "professor@euro-sync.com", role: "PROFESSOR", status: "ACTIVE" },
  })

  const professor2 = await prisma.user.upsert({
    where: { email: "professor2@euro-sync.com" },
    update: {},
    create: { name: "Marcos Lima", email: "professor2@euro-sync.com", role: "PROFESSOR", status: "ACTIVE" },
  })

  const studentNames = [
    "Ana Pereira",
    "Bruno Costa",
    "Camila Rocha",
    "Diego Alves",
    "Elisa Martins",
    "Felipe Nunes",
  ]

  const students = []
  for (let i = 0; i < studentNames.length; i++) {
    const email = `student${i + 1}@euro-sync.com`
    const student = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name: studentNames[i], email, role: "STUDENT", status: "ACTIVE" },
    })
    students.push(student)
  }

  const classA = await prisma.class.upsert({
    where: { id: "seed-class-8a" },
    update: {},
    create: {
      id: "seed-class-8a",
      name: "Turma 8A",
      description: "Turma piloto",
      status: "ACTIVE",
      teacherId: professor.id,
    },
  })

  const classB = await prisma.class.upsert({
    where: { id: "seed-class-cn03" },
    update: {},
    create: {
      id: "seed-class-cn03",
      name: "CN-03",
      description: "Ciências da natureza",
      status: "ACTIVE",
      teacherId: professor2.id,
    },
  })

  for (const student of students.slice(0, 4)) {
    await prisma.classStudent.upsert({
      where: { classId_studentId: { classId: classA.id, studentId: student.id } },
      update: {},
      create: { classId: classA.id, studentId: student.id },
    })
  }
  for (const student of students.slice(3)) {
    await prisma.classStudent.upsert({
      where: { classId_studentId: { classId: classB.id, studentId: student.id } },
      update: {},
      create: { classId: classB.id, studentId: student.id },
    })
  }

  const now = new Date()
  const lessons = []
  for (let i = 0; i < 3; i++) {
    const isCurrent = i === 2
    // A última aula fica acontecendo agora para que o check-in seja testável logo após o seed.
    const startsAt = isCurrent ? new Date(now.getTime() - 15 * 60_000) : new Date(now)
    if (!isCurrent) {
      startsAt.setDate(now.getDate() - (2 - i))
      startsAt.setHours(8, 0, 0, 0)
    }
    const endsAt = isCurrent ? new Date(now.getTime() + 90 * 60_000) : new Date(startsAt)
    if (!isCurrent) endsAt.setHours(9, 0, 0, 0)

    const lesson = await prisma.lesson.upsert({
      where: { id: `seed-lesson-a-${i}` },
      update: {},
      create: {
        id: `seed-lesson-a-${i}`,
        classId: classA.id,
        title: `Aula ${i + 1}`,
        startsAt,
        endsAt,
        status: i < 2 ? "CLOSED" : "OPEN",
        locationName: "Sala 12",
        locationLat: -23.5505,
        locationLng: -46.6333,
        locationRadiusM: 150,
        qrCodeToken: "EURODEMO",
      },
    })
    lessons.push(lesson)
  }

  const statuses = ["PRESENT", "PRESENT", "ABSENT", "LATE"] as const
  for (const lesson of lessons.slice(0, 2)) {
    for (let i = 0; i < 4; i++) {
      const student = students[i]
      await prisma.attendance.upsert({
        where: { lessonId_studentId: { lessonId: lesson.id, studentId: student.id } },
        update: {},
        create: {
          lessonId: lesson.id,
          studentId: student.id,
          status: statuses[i],
          checkinMethod: "LOCATION",
          latitude: -23.5505,
          longitude: -46.6333,
          checkedInAt: lesson.startsAt,
        },
      })
    }
  }

  await prisma.alert.upsert({
    where: { id: "seed-alert-1" },
    update: {},
    create: {
      id: "seed-alert-1",
      status: "OPEN",
      severity: "HIGH",
      type: "LOW_ATTENDANCE",
      message: "Frequência abaixo do esperado nesta semana.",
      studentId: students[2].id,
      classId: classA.id,
    },
  })

  await prisma.alert.upsert({
    where: { id: "seed-alert-2" },
    update: {},
    create: {
      id: "seed-alert-2",
      status: "OPEN",
      severity: "MEDIUM",
      type: "DROPPING_PROGRESS",
      message: "Progresso caiu 15% no último mês.",
      studentId: students[0].id,
      classId: classB.id,
    },
  })

  await prisma.integration.upsert({
    where: { id: "seed-integration-moodle" },
    update: {},
    create: {
      id: "seed-integration-moodle",
      name: "Moodle",
      provider: "Moodle",
      baseUrl: "https://moodle.euro-sync.example",
      status: "ACTIVE",
    },
  })

  const lmsCounts: Record<(typeof LMS_ENTITIES)[number], number> = {
    COURSES: 8,
    CLASSES: 12,
    STUDENTS: 320,
    PROFESSORS: 18,
    ENROLLMENTS: 280,
    PROGRESS: 1250,
    ATTENDANCE: 640,
    ACTIVITIES: 154,
    GRADES: 780,
    COMPLETIONS: 90,
  }

  for (const entity of LMS_ENTITIES) {
    await prisma.lmsSyncState.upsert({
      where: { entity },
      update: {},
      create: {
        entity,
        count: lmsCounts[entity],
        lastSyncAt: now,
        status: "SUCCESS",
      },
    })
  }

  await prisma.lmsSyncLog.upsert({
    where: { id: "seed-log-1" },
    update: {},
    create: {
      id: "seed-log-1",
      timestamp: now,
      action: "full_sync",
      entity: "COURSES",
      recordsProcessed: 8,
      status: "SUCCESS",
      message: "Sincronização concluída com sucesso",
    },
  })

  await prisma.lmsStudentRecord.upsert({
    where: { id: "seed-lms-student-1" },
    update: {},
    create: {
      id: "seed-lms-student-1",
      name: "Ana Pereira",
      email: "student1@euro-sync.com",
      enrollment: "2026001",
      progress: 78,
      digitalPresence: 92,
      status: "ACTIVE",
    },
  })

  console.log("Seed concluído.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
