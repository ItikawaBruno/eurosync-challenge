import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { provisionClerkUser, normalizeRole } from "@/lib/clerk-provision"

type ImportRow = { name: string; email: string; role: string }

type ImportResult = { email: string; status: "created" | "error"; message?: string }

export async function POST(request: NextRequest) {
  return withApi(async () => {
    await requireRole("ADMIN")
    const body = await request.json()
    const rows: ImportRow[] = Array.isArray(body.rows) ? body.rows : []

    const results: ImportResult[] = []

    for (const row of rows) {
      const name = row.name?.trim()
      const email = row.email?.trim().toLowerCase()
      const role = normalizeRole(row.role ?? "")

      if (!name || !email || !role) {
        results.push({ email: email || "(sem email)", status: "error", message: "Nome, e-mail ou role invalido" })
        continue
      }

      try {
        await provisionClerkUser({ name, email, role })
        results.push({ email, status: "created" })
      } catch (error) {
        results.push({ email, status: "error", message: error instanceof Error ? error.message : "Erro desconhecido" })
      }
    }

    return NextResponse.json({ results })
  })
}
