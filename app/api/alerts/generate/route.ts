import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { generateAlertsForUser } from "@/lib/alert-rules"

export async function POST() {
  return withApi(async () => {
    const user = await requireRole("ADMIN", "PROFESSOR")
    const result = await generateAlertsForUser(user)
    return NextResponse.json(result, { status: 201 })
  })
}
