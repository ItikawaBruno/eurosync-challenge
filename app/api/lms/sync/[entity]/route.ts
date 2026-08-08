import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { isLmsEntityParam, toPrismaLmsEntity } from "@/lib/lms-entities"

export async function POST(_request: Request, ctx: RouteContext<"/api/lms/sync/[entity]">) {
  return withApi(async () => {
    await requireRole("ADMIN")
    const { entity } = await ctx.params

    if (!isLmsEntityParam(entity)) {
      return NextResponse.json({ error: "Entidade inválida." }, { status: 400 })
    }

    const prismaEntity = toPrismaLmsEntity(entity)
    const now = new Date()

    const state = await prisma.lmsSyncState.upsert({
      where: { entity: prismaEntity },
      update: { lastSyncAt: now, status: "SUCCESS" },
      create: { entity: prismaEntity, count: 0, lastSyncAt: now, status: "SUCCESS" },
    })

    await prisma.lmsSyncLog.create({
      data: {
        timestamp: now,
        action: "sync_entity",
        entity: prismaEntity,
        recordsProcessed: state.count,
        status: "SUCCESS",
        message: "Sincronização concluída com sucesso",
      },
    })

    return NextResponse.json(state)
  })
}
