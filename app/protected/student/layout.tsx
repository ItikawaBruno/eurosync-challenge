import type { ReactNode } from "react"
import { guardRoleSegment } from "@/lib/route-guard"

export default async function StudentLayout({ children }: { children: ReactNode }) {
  await guardRoleSegment("ADMIN", "STUDENT", "PARENT")
  return children
}
