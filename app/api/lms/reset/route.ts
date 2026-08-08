import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { withApi } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function POST() {
  return withApi(async () => {
    await requireRole("ADMIN")

    await prisma.lmsSyncState.updateMany({
      data: { count: 0, lastSyncAt: null, status: "PENDING" },
    })
    await prisma.lmsSyncLog.deleteMany({})
    await Promise.all([
      prisma.lmsCourseRecord.deleteMany({}),
      prisma.lmsClassRecord.deleteMany({}),
      prisma.lmsStudentRecord.deleteMany({}),
      prisma.lmsProfessorRecord.deleteMany({}),
      prisma.lmsEnrollmentRecord.deleteMany({}),
      prisma.lmsProgressRecord.deleteMany({}),
      prisma.lmsAttendanceRecord.deleteMany({}),
      prisma.lmsActivityRecord.deleteMany({}),
      prisma.lmsGradeRecord.deleteMany({}),
      prisma.lmsCompletionRecord.deleteMany({}),
    ])

    return NextResponse.json({ ok: true })
  })
}
