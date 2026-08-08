type StatusBadgeProps = {
  label?: string
  className?: string
  tone?: string
}

const toneMap: Record<string, string> = {
  OPEN: "bg-rose-50 text-rose-700 border-rose-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  IGNORED: "bg-slate-100 text-slate-700 border-slate-200",
  HIGH: "bg-rose-50 text-rose-700 border-rose-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  LOW: "bg-sky-50 text-sky-700 border-sky-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  default: "bg-slate-100 text-slate-700 border-slate-200",
}

export function StatusBadge({ label, className = "", tone }: StatusBadgeProps) {
  const toneClass = tone ? toneMap[tone] ?? toneMap.default : toneMap[label ?? ""] ?? toneMap.default
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${toneClass} ${className}`.trim()}>{label}</span>
}

export function RoleBadge({ label, className = "", role }: StatusBadgeProps & { role?: string }) {
  return <StatusBadge label={role ?? label} className={className} />
}
