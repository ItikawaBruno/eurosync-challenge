import { auth, currentUser } from "@clerk/nextjs/server"
import type { UserRole } from "@/types/platform"
import { prisma } from "@/lib/prisma"
import { syncClerkRole } from "@/lib/clerk-provision"

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized")
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden")
  }
}

async function provisionUser(clerkId: string) {
  const clerkUser = await currentUser()
  if (!clerkUser) throw new UnauthorizedError()

  const email = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress
    ?? clerkUser.emailAddresses[0]?.emailAddress

  if (!email) throw new UnauthorizedError()

  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || email

  const metadataRole = clerkUser.publicMetadata?.role as UserRole | undefined
  const role: UserRole = metadataRole
    ?? (email.toLowerCase() === (process.env.SEED_ADMIN_EMAIL || "").toLowerCase() && email ? "ADMIN" : "STUDENT")

  const user = await prisma.user.upsert({
    where: { email },
    update: { clerkId },
    create: { clerkId, email, name, role, status: "ACTIVE" },
  })

  await syncClerkRole(clerkId, user.role)
  return user
}

export async function requireUser() {
  const { userId } = await auth()
  if (!userId) throw new UnauthorizedError()

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (existing) return existing

  return provisionUser(userId)
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireUser()
  if (!roles.includes(user.role)) throw new ForbiddenError()
  return user
}

export async function requireClassAccess(classId: string) {
  const user = await requireUser()
  if (user.role === "ADMIN") return user

  if (user.role === "PROFESSOR") {
    const owns = await prisma.class.findFirst({ where: { id: classId, teacherId: user.id } })
    if (!owns) throw new ForbiddenError()
    return user
  }

  if (user.role === "STUDENT") {
    const enrolled = await prisma.classStudent.findUnique({
      where: { classId_studentId: { classId, studentId: user.id } },
    })
    if (!enrolled) throw new ForbiddenError()
    return user
  }

  throw new ForbiddenError()
}

export async function requireClassManage(classId: string) {
  const user = await requireUser()
  if (user.role === "ADMIN") return user

  if (user.role === "PROFESSOR") {
    const owns = await prisma.class.findFirst({ where: { id: classId, teacherId: user.id } })
    if (!owns) throw new ForbiddenError()
    return user
  }

  throw new ForbiddenError()
}

export async function requireLessonManage(lessonId: string) {
  const user = await requireUser()
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, classId: true, class: { select: { teacherId: true } } },
  })
  if (!lesson) throw new ForbiddenError()

  if (user.role === "ADMIN") return { user, lesson }
  if (user.role === "PROFESSOR" && lesson.class.teacherId === user.id) return { user, lesson }

  throw new ForbiddenError()
}
