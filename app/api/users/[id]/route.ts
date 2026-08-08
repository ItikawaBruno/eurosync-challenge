import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"

function serialize(user: { id: string; name: string; email: string; role: string; status: string }) {
  return { ...user, isActive: user.status === "ACTIVE" }
}

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/users/[id]">) {
  return withApi(async () => {
    await requireRole("ADMIN", "PROFESSOR")
    const { id } = await ctx.params
    const user = await prisma.user.findUniqueOrThrow({ where: { id } })
    return NextResponse.json(serialize(user))
  })
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/users/[id]">) {
  return withApi(async () => {
    await requireRole("ADMIN")
    const { id } = await ctx.params
    const body = await request.json()

    const user = await prisma.user.update({
      where: { id },
      data: { name: body.name },
    })

    return NextResponse.json(serialize(user))
  })
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/users/[id]">) {
  return withApi(async () => {
    await requireRole("ADMIN")
    const { id } = await ctx.params

    const user = await prisma.user.update({
      where: { id },
      data: { status: "INACTIVE" },
    })

    return NextResponse.json(serialize(user))
  })
}
