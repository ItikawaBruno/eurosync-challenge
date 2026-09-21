"use client"

import type { ReactNode } from "react"
import { AppHeader } from "@/components/platform/layout/app-header"
import { AppSidebar } from "@/components/platform/layout/app-sidebar"
import type { UserRole } from "@/types/platform"

export function PlatformShell({ role, children }: { role: UserRole; children: ReactNode }) {
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
