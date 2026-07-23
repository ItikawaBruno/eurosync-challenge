import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react"

type InputProps = InputHTMLAttributes<HTMLInputElement>

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Input(props: InputProps) {
  return <input {...props} className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-0 ${props.className ?? ""}`.trim()} />
}

export function Textarea(props: TextareaProps) {
  return <textarea {...props} className={`min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-0 ${props.className ?? ""}`.trim()} />
}

type FilterBarProps = {
  children: ReactNode
  searchPlaceholder?: string
}

export function FilterBar({ children, searchPlaceholder }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      {searchPlaceholder ? <input className="w-full max-w-xs rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" placeholder={searchPlaceholder} /> : null}
      {children}
    </div>
  )
}
