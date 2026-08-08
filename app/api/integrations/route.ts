import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function GET() {
  return withApi(async () => {
    await requireRole("ADMIN")
    const integrations = await prisma.integration.findMany({ orderBy: { name: "asc" } })
    return NextResponse.json(integrations)
  })
}
