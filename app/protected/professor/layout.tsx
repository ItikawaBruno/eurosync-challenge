import type { ReactNode } from "react"
import { guardRoleSegment } from "@/lib/route-guard"

export default async function ProfessorLayout({ children }: { children: ReactNode }) {
  await guardRoleSegment("ADMIN", "PROFESSOR")
  return children
}
