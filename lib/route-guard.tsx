import { redirect } from "next/navigation"
import { requireUser } from "@/lib/auth-server"
import { roleHome } from "@/lib/platform-navigation"
import { ROLE_CHECKS_ENABLED } from "@/lib/open-access"
import type { UserRole } from "@/types/platform"

/**
 * A lista `allowed` fica registrada nos call sites de propósito: ela documenta
 * a intenção original de cada segmento e volta a valer sozinha quando
 * `ROLE_CHECKS_ENABLED` for `true`. Hoje qualquer usuário logado entra em
 * qualquer segmento.
 */
export async function guardRoleSegment(...allowed: UserRole[]) {
  const user = await requireUser()
  if (!ROLE_CHECKS_ENABLED) return user
  if (!allowed.includes(user.role)) redirect(roleHome[user.role])
  return user
}
