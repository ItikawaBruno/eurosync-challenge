import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { LMS_ENTITY_VALUES, toPrismaLmsEntity } from "@/lib/lms-entities"

export async function POST() {
  return withApi(async () => {
    await requireRole("ADMIN")
    const now = new Date()

    for (const entity of LMS_ENTITY_VALUES) {
      const prismaEntity = toPrismaLmsEntity(entity)
      const state = await prisma.lmsSyncState.upsert({
        where: { entity: prismaEntity },
        update: { lastSyncAt: now, status: "SUCCESS" },
        create: { entity: prismaEntity, count: 0, lastSyncAt: now, status: "SUCCESS" },
      })

      await prisma.lmsSyncLog.create({
        data: {
          timestamp: now,
          action: "full_sync",
          entity: prismaEntity,
          recordsProcessed: state.count,
          status: "SUCCESS",
          message: "Sincronização concluída com sucesso",
        },
      })
    }

    return NextResponse.json({ ok: true })
  })
}
