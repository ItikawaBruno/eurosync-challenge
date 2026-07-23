import type { ReactNode } from "react"

type CardProps = {
  children: ReactNode
  className?: string
}

type SectionCardProps = CardProps & {
  title?: string
  description?: string
  contentClassName?: string
}

export function Card({ children, className = "" }: CardProps) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`.trim()}>{children}</div>
}

export function SectionCard({ children, className = "", title, description, contentClassName = "" }: SectionCardProps) {
  return (
    <section className={`mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`.trim()}>
      {(title || description) && (
        <div className="mb-4">
          {title ? <h2 className="text-lg font-semibold text-slate-900">{title}</h2> : null}
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  )
}
