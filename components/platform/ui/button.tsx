import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react"

type ButtonVariant = "default" | "outline" | "accent" | "ghost" | "secondary" | "danger" | "destructive" | "primary"

type ButtonSize = "sm" | "md" | "lg" | "icon"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const baseClass = "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"

const variantClass: Record<ButtonVariant, string> = {
  default: "bg-slate-900 text-white hover:bg-slate-800",
  outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  accent: "bg-violet-600 text-white hover:bg-violet-700",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  danger: "bg-red-600 text-white hover:bg-red-700",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  primary: "bg-slate-900 text-white hover:bg-slate-800",
}

const sizeClass: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
  icon: "h-10 w-10 p-0",
}

export function Button({ variant = "default", size = "md", className = "", ...props }: ButtonProps) {
  return <button className={`${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`.trim()} {...props} />
}

export function ButtonLink({ variant = "default", size = "md", className = "", ...props }: ButtonLinkProps) {
  return <a className={`${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`.trim()} {...props} />
}
