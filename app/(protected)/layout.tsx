import type { ReactNode } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { PlatformShell } from "@/components/platform/layout/platform-shell"
import { requireUser } from "@/lib/auth-server"

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/auth/candidate/sign-in")
  }

  const user = await requireUser()

  return <PlatformShell role={user.role}>{children}</PlatformShell>
}
