import type { UserRole } from "@/types/platform"

export function roleFromPath(pathname: string): UserRole {
  const segments = pathname.split("/").filter(Boolean)
  const index = segments.indexOf("protected")
  const roleSegment = index >= 0 ? segments[index + 1] : segments[0]

  switch (roleSegment) {
    case "admin":
      return "ADMIN"
    case "professor":
      return "PROFESSOR"
    case "student":
      return "STUDENT"
    default:
      return "ADMIN"
  }
}
