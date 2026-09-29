"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { roleHome, roleLabel } from "@/lib/platform-navigation"
import type { UserRole } from "@/types/platform"

const SWITCHABLE: UserRole[] = ["ADMIN", "PROFESSOR", "STUDENT"]

export function RoleSwitcher({ role }: { role: UserRole }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saving, setSaving] = useState<UserRole | null>(null)

  const switchTo = async (next: UserRole) => {
    if (next === role) return
    setSaving(next)
    try {
      await fetch("/api/acting-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      })
      startTransition(() => {
        router.push(roleHome[next])
        router.refresh()
      })
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="flex items-center rounded-full border border-slate-300 bg-white p-0.5">
      {SWITCHABLE.map((option) => {
        const active = option === role
        return (
          <button
            key={option}
            type="button"
            disabled={isPending || saving !== null}
            onClick={() => switchTo(option)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
              active ? "bg-[#002147] text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {roleLabel[option]}
          </button>
        )
      })}
    </div>
  )
}
