import { clerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@/types/platform"

export function normalizeRole(input: string): UserRole | null {
  const value = input.trim().toUpperCase()
  if (["ADMIN", "ADMINISTRADOR"].includes(value)) return "ADMIN"
  if (["PROFESSOR", "PROFESSORA", "TEACHER"].includes(value)) return "PROFESSOR"
  if (["STUDENT", "ALUNO", "ALUNA", "ESTUDANTE"].includes(value)) return "STUDENT"
  if (["PARENT", "RESPONSAVEL", "RESPONSÁVEL"].includes(value)) return "PARENT"
  return null
}

export async function syncClerkRole(clerkId: string, role: UserRole) {
  const client = await clerkClient()
  await client.users.updateUserMetadata(clerkId, { publicMetadata: { role } })
}

export async function provisionClerkUser({ name, email, role }: { name: string; email: string; role: UserRole }) {
  const client = await clerkClient()
  const [firstName, ...rest] = name.trim().split(/\s+/)
  const lastName = rest.join(" ") || undefined

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing?.clerkId) {
    await syncClerkRole(existing.clerkId, role)
    return prisma.user.update({ where: { email }, data: { name, role, status: "ACTIVE" } })
  }

  const existingClerkUsers = await client.users.getUserList({ emailAddress: [email] })
  let clerkUser = existingClerkUsers.data[0]

  if (!clerkUser) {
    clerkUser = await client.users.createUser({
      emailAddress: [email],
      firstName,
      lastName,
      skipPasswordRequirement: true,
      publicMetadata: { role },
    })
  } else {
    await client.users.updateUserMetadata(clerkUser.id, { publicMetadata: { role } })
  }

  return prisma.user.upsert({
    where: { email },
    update: { clerkId: clerkUser.id, name, role, status: "ACTIVE" },
    create: { clerkId: clerkUser.id, email, name, role, status: "ACTIVE" },
  })
}
