import type { ReactNode } from "react"
import { guardRoleSegment } from "@/lib/route-guard"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await guardRoleSegment("ADMIN")
  return children
}
