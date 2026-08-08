import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { provisionClerkUser } from "@/lib/clerk-provision"
import type { UserRole } from "@/types/platform"

function serialize(user: { id: string; name: string; email: string; role: string; status: string }) {
  return { ...user, isActive: user.status === "ACTIVE" }
}

export async function GET(request: NextRequest) {
  return withApi(async () => {
    await requireRole("ADMIN")
    const role = request.nextUrl.searchParams.get("role") as UserRole | null

    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      orderBy: { name: "asc" },
    })

    return NextResponse.json(users.map(serialize))
  })
}

export async function POST(request: NextRequest) {
  return withApi(async () => {
    await requireRole("ADMIN")
    const body = await request.json()

    const user = await provisionClerkUser({ name: body.name, email: body.email, role: body.role })

    return NextResponse.json(serialize(user), { status: 201 })
  })
}
