export type UserRole = "ADMIN" | "PROFESSOR" | "STUDENT" | "PARENT"

export type ApiUser = {
  id: string
  name: string
  email: string
  role: UserRole
  status?: string
}
