import { redirect } from "next/navigation"
import { requireUser } from "@/lib/auth-server"
import { roleHome } from "@/lib/platform-navigation"
import type { UserRole } from "@/types/platform"

export async function guardRoleSegment(...allowed: UserRole[]) {
  const user = await requireUser()
  if (!allowed.includes(user.role)) redirect(roleHome[user.role])
  return user
}
