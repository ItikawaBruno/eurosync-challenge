import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { isLmsEntityParam, lmsRecordDelegate } from "@/lib/lms-entities"

export async function GET(_request: Request, ctx: RouteContext<"/api/lms/data/[entity]">) {
  return withApi(async () => {
    await requireRole("ADMIN")
    const { entity } = await ctx.params

    if (!isLmsEntityParam(entity)) {
      return NextResponse.json({ error: "Entidade inválida." }, { status: 400 })
    }

    const records = await (lmsRecordDelegate(entity) as { findMany: (args?: unknown) => Promise<unknown[]> }).findMany()
    return NextResponse.json(records)
  })
}
