import { redirect } from "next/navigation"
import { requireUser } from "@/lib/auth-server"
import { roleHome } from "@/lib/platform-navigation"

// Destino do Clerk apos o login. Fica fora do route group (protected) porque
// ali a rota resolveria para "/" e colidiria com a landing em app/page.tsx.
export default async function PosLoginPage() {
  const user = await requireUser()
  redirect(roleHome[user.role] ?? roleHome.STUDENT)
}
