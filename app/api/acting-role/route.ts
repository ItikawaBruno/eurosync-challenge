import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { withApi } from "@/lib/api"
import { ACTING_ROLE_COOKIE, SWITCHABLE_ROLES } from "@/lib/open-access"
import type { UserRole } from "@/types/platform"

export async function POST(request: NextRequest) {
  return withApi(async () => {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const role = body.role as UserRole
    if (!SWITCHABLE_ROLES.includes(role)) {
      return NextResponse.json({ error: "Perfil inválido." }, { status: 400 })
    }

    const response = NextResponse.json({ role })
    response.cookies.set(ACTING_ROLE_COOKIE, role, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    })
    return response
  })
}
