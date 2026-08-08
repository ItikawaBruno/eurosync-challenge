"use client"

import { UserButton } from "@clerk/nextjs"
import { roleLabel } from "@/lib/platform-navigation"
import type { UserRole } from "@/types/platform"

export function UserAvatar({ role }: { role: UserRole }) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-none text-slate-900">Minha conta</p>
        <p className="mt-1 text-xs text-slate-500">{roleLabel[role]}</p>
      </div>
      <UserButton />
    </div>
  )
}
