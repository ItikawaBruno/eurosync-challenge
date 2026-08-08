import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/alerts/[id]">) {
  return withApi(async () => {
    await requireRole("ADMIN", "PROFESSOR")
    const { id } = await ctx.params
    const body = await request.json()

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status: body.status,
        resolvedAt: body.status === "RESOLVED" ? new Date() : null,
      },
      include: {
        student: { select: { name: true } },
        class: { select: { name: true } },
      },
    })

    return NextResponse.json(alert)
  })
}
