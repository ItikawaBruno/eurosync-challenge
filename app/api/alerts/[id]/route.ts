import { NextRequest, NextResponse } from "next/server"
import { requireUser, ForbiddenError } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/alerts/[id]">) {
  return withApi(async () => {
    const user = await requireUser()
    const { id } = await ctx.params
    const body = await request.json()

    if (user.role === "STUDENT") {
      if (body.status !== "RESOLVED") throw new ForbiddenError()
      const existing = await prisma.alert.findUniqueOrThrow({ where: { id } })
      if (existing.studentId !== user.id) throw new ForbiddenError()
    } else if (user.role !== "ADMIN" && user.role !== "PROFESSOR") {
      throw new ForbiddenError()
    }

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
