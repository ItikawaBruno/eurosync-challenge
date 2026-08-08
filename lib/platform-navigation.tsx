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
  { title: "Dashboard", href: "/protected/admin/dashboard", icon: LayoutDashboard, roles: ["ADMIN"] },
  { title: "Turmas", href: "/protected/admin/classes", icon: School, roles: ["ADMIN"] },
  { title: "Usuarios", href: "/protected/admin/users", icon: Users, roles: ["ADMIN"] },
  { title: "Alertas", href: "/protected/admin/alerts", icon: AlertTriangle, roles: ["ADMIN"] },
  { title: "Importacoes", href: "/protected/admin/imports", icon: UploadCloud, roles: ["ADMIN"] },
  { title: "Integracao LMS", href: "/protected/admin/lms-integration", icon: PlugZap, roles: ["ADMIN"] },
  { title: "Relatorios", href: "/protected/admin/reports", icon: BarChart3, roles: ["ADMIN"] },

  { title: "Dashboard", href: "/protected/professor/dashboard", icon: LayoutDashboard, roles: ["PROFESSOR"] },
  { title: "Minhas turmas", href: "/protected/professor/classes", icon: School, roles: ["PROFESSOR"] },
  { title: "Alertas", href: "/protected/professor/alerts", icon: AlertTriangle, roles: ["PROFESSOR"] },

  { title: "Minha jornada", href: "/protected/student/dashboard", icon: LayoutDashboard, roles: ["STUDENT"] },
  { title: "Confirmar presenca", href: "/protected/student/check-in", icon: CalendarDays, roles: ["STUDENT"] },
  { title: "Agenda", href: "/protected/student/schedule", icon: CalendarDays, roles: ["STUDENT"] },
  { title: "Progresso", href: "/protected/student/progress", icon: BarChart3, roles: ["STUDENT"] },
  { title: "Avisos", href: "/protected/student/notifications", icon: Bell, roles: ["STUDENT"] },
]

export const roleLabel: Record<UserRole, string> = {
  ADMIN: "Administrador",
  PROFESSOR: "Professor",
  STUDENT: "Aluno",
  PARENT: "Responsavel",
}

export const roleHome: Record<UserRole, string> = {
  ADMIN: "/protected/admin/dashboard",
  PROFESSOR: "/protected/professor/dashboard",
  STUDENT: "/protected/student/dashboard",
  PARENT: "/protected/student/dashboard",
}
