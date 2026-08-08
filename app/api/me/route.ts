import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth-server"
import { withApi } from "@/lib/api"

export async function GET() {
  return withApi(async () => {
    const user = await requireUser()
    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role })
  })
}
