import { redirect } from "next/navigation"
import { requireUser } from "@/lib/auth-server"
import { roleHome } from "@/lib/platform-navigation"

export default async function ProtectedIndexPage() {
  const user = await requireUser()
  redirect(roleHome[user.role] ?? roleHome.STUDENT)
}
