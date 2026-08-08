import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { LMS_ENTITY_VALUES, toPrismaLmsEntity } from "@/lib/lms-entities"

export async function GET() {
  return withApi(async () => {
    await requireRole("ADMIN")

    const states = await prisma.lmsSyncState.findMany()
    const byEntity = new Map(states.map((s) => [s.entity, s]))

    const overview: Record<string, { count: number; lastSync: Date | null; status: string }> = {}
    for (const entity of LMS_ENTITY_VALUES) {
      const state = byEntity.get(toPrismaLmsEntity(entity))
      overview[entity] = {
        count: state?.count ?? 0,
        lastSync: state?.lastSyncAt ?? null,
        status: (state?.status ?? "PENDING").toLowerCase(),
      }
    }

    return NextResponse.json({
      syncs: states.filter((s) => s.lastSyncAt).length,
      pending: states.filter((s) => s.status === "PENDING").length,
      ...overview,
    })
  })
}
