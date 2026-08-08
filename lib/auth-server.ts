import { auth, currentUser } from "@clerk/nextjs/server"
import type { UserRole } from "@/types/platform"
import { prisma } from "@/lib/prisma"

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

  const role: UserRole = email.toLowerCase() === (process.env.SEED_ADMIN_EMAIL || "").toLowerCase() && email
    ? "ADMIN"
    : "STUDENT"

  return prisma.user.upsert({
    where: { email },
    update: { clerkId },
    create: { clerkId, email, name, role, status: "ACTIVE" },
  })
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
