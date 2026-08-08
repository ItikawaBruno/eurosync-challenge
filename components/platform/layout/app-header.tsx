"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, Search } from "lucide-react"
import { AppSidebar } from "@/components/platform/layout/app-sidebar"
import { UserAvatar } from "@/components/platform/layout/user-avatar"
import type { UserRole } from "@/types/platform"

function breadcrumbFromPath(pathname: string) {
  return pathname
    .split("/")
    .filter(Boolean)
    .filter((part) => part !== "protected")
    .map((part) => part.replace(/-/g, " "))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
}

export function AppHeader({ role }: { role: UserRole }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const crumbs = breadcrumbFromPath(pathname ?? "")

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6 lg:ml-72">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label="Abrir menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 lg:hidden"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-sm text-slate-500 sm:flex">
          {crumbs.map((crumb, index) => (
            <span className="truncate" key={`${crumb}-${index}`}>
              {index > 0 ? <span className="mx-2 text-slate-300">/</span> : null}
              {crumb}
            </span>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <label className="relative hidden w-72 md:block">
          <span className="sr-only">Buscar na plataforma</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none"
            placeholder="Buscar turmas, usuarios, aulas"
            type="search"
          />
        </label>
        <UserAvatar role={role} />
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden">
          <div className="h-full w-80 max-w-[85vw]">
            <AppSidebar mobile onClose={() => setOpen(false)} role={role} />
          </div>
        </div>
      ) : null}
    </header>
  )
}
