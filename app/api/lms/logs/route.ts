import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function GET() {
  return withApi(async () => {
    await requireRole("ADMIN")
    const logs = await prisma.lmsSyncLog.findMany({ orderBy: { timestamp: "desc" }, take: 50 })
    return NextResponse.json(logs)
  })
}
