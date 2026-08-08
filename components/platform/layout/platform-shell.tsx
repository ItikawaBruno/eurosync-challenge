"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { AppHeader } from "@/components/platform/layout/app-header"
import { AppSidebar } from "@/components/platform/layout/app-sidebar"
import { roleFromPath } from "@/lib/platform-auth"

export function PlatformShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const role = roleFromPath(pathname ?? "")

  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar role={role} />
      <AppHeader role={role} />
      <main className="px-4 py-6 md:px-6 lg:ml-72">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>
      </main>
    </div>
  )
}
