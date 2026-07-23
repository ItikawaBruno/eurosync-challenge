"use client"

import { useMemo, useState, type ReactNode } from "react"

type OverlayState = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export function useOverlayState(): OverlayState {
  const [isOpen, setIsOpen] = useState(false)

  return useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((value) => !value),
    }),
    [isOpen],
  )
}

type AppModalProps = {
  state: OverlayState
  title?: string
  children?: ReactNode
  footer?: ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

export function AppModal({ state, title, children, footer, size = "lg" }: AppModalProps) {
  if (!state.isOpen) return null

  const widthClass = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className={`w-full ${widthClass} rounded-3xl border border-slate-200 bg-white p-6 shadow-xl`}>
        {title ? <h3 className="text-lg font-semibold text-slate-900">{title}</h3> : null}
        <div className="mt-4">{children}</div>
        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  )
}

export type { OverlayState }
