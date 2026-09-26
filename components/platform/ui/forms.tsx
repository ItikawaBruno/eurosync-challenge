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
  /** Obrigatórios junto com searchPlaceholder: o campo é controlado, não decorativo. */
  searchValue?: string
  onSearchChange?: (value: string) => void
}

export function FilterBar({ children, searchPlaceholder, searchValue, onSearchChange }: FilterBarProps) {
  // Só renderiza a busca quando ela de fato filtra algo. Um input sem handler
  // faz o usuário concluir que o sistema está quebrado.
  const showSearch = Boolean(searchPlaceholder && onSearchChange)

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      {showSearch ? (
        <input
          className="w-full max-w-xs rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
          placeholder={searchPlaceholder}
          value={searchValue ?? ""}
          onChange={(event) => onSearchChange?.(event.target.value)}
        />
      ) : null}
      {children}
    </div>
  )
}
