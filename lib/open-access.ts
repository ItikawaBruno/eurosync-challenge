import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@/types/platform"

/**
 * ACESSO ABERTO — decisão de produto, não descuido.
 *
 * Qualquer usuário logado pode abrir qualquer tela (admin, professor ou aluno) e
 * alternar o perfil pelo seletor do cabeçalho. As guardas de role por segmento e
 * as checagens de posse da API (`requireRole`, `requireClassAccess`,
 * `requireClassManage`, `requireLessonManage`) passam a liberar todo mundo.
 *
 * Só a exigência de sessão permanece: sem login, o `proxy.ts` ainda barra.
 *
 * Para voltar a restringir por role, o ponto único é `ROLE_CHECKS_ENABLED`:
 * mude para `true` e as guardas originais voltam a valer, sem outra alteração.
 */
export const ROLE_CHECKS_ENABLED = false

export const ACTING_ROLE_COOKIE = "euro-sync-acting-role"

export const SWITCHABLE_ROLES: UserRole[] = ["ADMIN", "PROFESSOR", "STUDENT"]

/** Perfil escolhido no seletor do cabeçalho, se houver. */
export async function readActingRole(): Promise<UserRole | null> {
  const value = (await cookies()).get(ACTING_ROLE_COOKIE)?.value as UserRole | undefined
  return value && SWITCHABLE_ROLES.includes(value) ? value : null
}

/**
 * Escolhe quem representa o perfil pedido. Prefere alguém com dados de verdade
 * (professor com turmas, aluno com matrícula) para as telas não abrirem vazias —
 * os dados de professor e aluno são filtrados por `user.id`, então sem isso
 * trocar de perfil mostraria dashboards em branco.
 */
export async function findUserForRole(role: UserRole) {
  if (role === "PROFESSOR") {
    const withClasses = await prisma.user.findFirst({
      where: { role: "PROFESSOR", status: "ACTIVE", taughtClasses: { some: {} } },
      orderBy: { createdAt: "asc" },
    })
    if (withClasses) return withClasses
  }

  if (role === "STUDENT") {
    const withEnrollment = await prisma.user.findFirst({
      where: { role: "STUDENT", status: "ACTIVE", enrollments: { some: {} } },
      orderBy: { createdAt: "asc" },
    })
    if (withEnrollment) return withEnrollment
  }

  return prisma.user.findFirst({
    where: { role, status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  })
}
