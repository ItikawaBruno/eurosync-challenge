import {
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  PlugZap,
  School,
  UploadCloud,
  Users,
} from "lucide-react"
import type { UserRole } from "@/types/platform"

export const BrandIcon = GraduationCap

export type NavItem = {
  title: string
  href: string
  icon: typeof LayoutDashboard
  roles: UserRole[]
}

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, roles: ["ADMIN"] },
  { title: "Turmas", href: "/admin/classes", icon: School, roles: ["ADMIN"] },
  { title: "Usuarios", href: "/admin/users", icon: Users, roles: ["ADMIN"] },
  { title: "Alertas", href: "/admin/alerts", icon: AlertTriangle, roles: ["ADMIN"] },
  { title: "Importacoes", href: "/admin/imports", icon: UploadCloud, roles: ["ADMIN"] },
  { title: "Integracao LMS", href: "/admin/lms-integration", icon: PlugZap, roles: ["ADMIN"] },
  { title: "Relatorios", href: "/admin/reports", icon: BarChart3, roles: ["ADMIN"] },

  { title: "Dashboard", href: "/professor/dashboard", icon: LayoutDashboard, roles: ["PROFESSOR"] },
  { title: "Minhas turmas", href: "/professor/classes", icon: School, roles: ["PROFESSOR"] },
  { title: "Alertas", href: "/professor/alerts", icon: AlertTriangle, roles: ["PROFESSOR"] },

  { title: "Minha jornada", href: "/student/dashboard", icon: LayoutDashboard, roles: ["STUDENT"] },
  { title: "Minhas turmas", href: "/student/classes", icon: School, roles: ["STUDENT"] },
  { title: "Confirmar presenca", href: "/student/check-in", icon: CalendarDays, roles: ["STUDENT"] },
  { title: "Agenda", href: "/student/schedule", icon: CalendarDays, roles: ["STUDENT"] },
  { title: "Progresso", href: "/student/progress", icon: BarChart3, roles: ["STUDENT"] },
  { title: "Avisos", href: "/student/notifications", icon: Bell, roles: ["STUDENT"] },
]

export const roleLabel: Record<UserRole, string> = {
  ADMIN: "Administrador",
  PROFESSOR: "Professor",
  STUDENT: "Aluno",
  PARENT: "Responsavel",
}

export const roleHome: Record<UserRole, string> = {
  ADMIN: "/admin/dashboard",
  PROFESSOR: "/professor/dashboard",
  STUDENT: "/student/dashboard",
  PARENT: "/student/dashboard",
}
