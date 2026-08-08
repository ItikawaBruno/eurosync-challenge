import { NextRequest, NextResponse } from "next/server"
import { requireUser, requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function GET() {
  return withApi(async () => {
    const user = await requireUser()

    const where =
      user.role === "PROFESSOR"
        ? { teacherId: user.id }
        : user.role === "STUDENT"
          ? { students: { some: { studentId: user.id } } }
          : undefined

    const classes = await prisma.class.findMany({
      where,
      orderBy: { name: "asc" },
      include: { _count: { select: { students: true, lessons: true } }, teacher: { select: { id: true, name: true } } },
    })

    return NextResponse.json(classes)
  })
}

export async function POST(request: NextRequest) {
  return withApi(async () => {
    await requireRole("ADMIN", "PROFESSOR")
    const body = await request.json()

    const cls = await prisma.class.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        teacherId: body.teacherId,
      },
      include: { _count: { select: { students: true, lessons: true } }, teacher: { select: { id: true, name: true } } },
    })

    return NextResponse.json(cls, { status: 201 })
  })
}
