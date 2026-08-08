"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { BrandIcon, navItems, roleHome, roleLabel } from "@/lib/platform-navigation"
import type { UserRole } from "@/types/platform"

export function AppSidebar({
  role,
  mobile = false,
  onClose,
}: {
  role: UserRole
  mobile?: boolean
  onClose?: () => void
}) {
  const pathname = usePathname()
  const items = navItems.filter((item) => item.roles.includes(role))

  return (
    <aside
      className={
        mobile
          ? "flex h-full w-full flex-col bg-[#002147] text-white"
          : "fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-white/10 bg-[#002147] text-white lg:flex"
      }
    >
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <Link className="flex items-center gap-3" href={roleHome[role]}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFCC00] text-[#002147]">
            <BrandIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-5">Gestao Educacional</span>
            <span className="block text-xs text-slate-300">Eurofarma Educacao</span>
          </span>
        </Link>
        {mobile ? (
          <button
            aria-label="Fechar menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>
      <nav aria-label="Navegacao principal" className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          return (
            <Link
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-white text-[#002147]" : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
              href={item.href}
              key={item.href}
              onClick={onClose}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-300">Perfil atual</p>
          <p className="mt-1 text-sm font-semibold">{roleLabel[role]}</p>
        </div>
      </div>
    </aside>
  )
}
