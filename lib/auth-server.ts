import { auth, currentUser } from "@clerk/nextjs/server"
import type { UserRole } from "@/types/platform"
import { prisma } from "@/lib/prisma"
import { ROLE_CHECKS_ENABLED, readActingRole, findUserForRole } from "@/lib/open-access"

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

export async function requireUser() {
  const { userId } = await auth()
  if (!userId) throw new UnauthorizedError()

  const clerkUser = await currentUser()
  if (!clerkUser) throw new UnauthorizedError()

  const email = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress
    ?? clerkUser.emailAddresses[0]?.emailAddress

  if (!email) throw new UnauthorizedError()

  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || email
  const role: UserRole = (clerkUser.publicMetadata?.role as UserRole | undefined) ?? "STUDENT"

  const realUser = await prisma.user.upsert({
    where: { email },
    update: { clerkId: userId, name, role },
    create: { clerkId: userId, email, name, role, status: "ACTIVE" },
  })

  // Perfil escolhido no seletor do cabeçalho: passa a agir como um usuário real
  // daquele role, para as telas mostrarem dados de verdade (turmas do professor,
  // matrículas do aluno) em vez de abrirem vazias. A conta real segue intacta.
  const actingRole = await readActingRole()
  if (actingRole && actingRole !== realUser.role) {
    const acting = await findUserForRole(actingRole)
    if (acting) return acting
  }

  return realUser
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireUser()
  if (!ROLE_CHECKS_ENABLED) return user
  if (!roles.includes(user.role)) throw new ForbiddenError()
  return user
}

export async function requireClassAccess(classId: string) {
  const user = await requireUser()
  if (!ROLE_CHECKS_ENABLED) return user
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
  if (!ROLE_CHECKS_ENABLED) return user
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

  if (!ROLE_CHECKS_ENABLED) return { user, lesson }
  if (user.role === "ADMIN") return { user, lesson }
  if (user.role === "PROFESSOR" && lesson.class.teacherId === user.id) return { user, lesson }

  throw new ForbiddenError()
}
