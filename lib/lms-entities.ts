import { prisma } from "@/lib/prisma"

export const LMS_ENTITY_VALUES = [
  "courses",
  "classes",
  "students",
  "professors",
  "enrollments",
  "progress",
  "attendance",
  "activities",
  "grades",
  "completions",
] as const

export type LmsEntityParam = (typeof LMS_ENTITY_VALUES)[number]

export function isLmsEntityParam(value: string): value is LmsEntityParam {
  return (LMS_ENTITY_VALUES as readonly string[]).includes(value)
}

export function toPrismaLmsEntity(entity: LmsEntityParam) {
  return entity.toUpperCase() as
    | "COURSES"
    | "CLASSES"
    | "STUDENTS"
    | "PROFESSORS"
    | "ENROLLMENTS"
    | "PROGRESS"
    | "ATTENDANCE"
    | "ACTIVITIES"
    | "GRADES"
    | "COMPLETIONS"
}

const RECORD_DELEGATE = {
  courses: () => prisma.lmsCourseRecord,
  classes: () => prisma.lmsClassRecord,
  students: () => prisma.lmsStudentRecord,
  professors: () => prisma.lmsProfessorRecord,
  enrollments: () => prisma.lmsEnrollmentRecord,
  progress: () => prisma.lmsProgressRecord,
  attendance: () => prisma.lmsAttendanceRecord,
  activities: () => prisma.lmsActivityRecord,
  grades: () => prisma.lmsGradeRecord,
  completions: () => prisma.lmsCompletionRecord,
} as const

export function lmsRecordDelegate(entity: LmsEntityParam) {
  return RECORD_DELEGATE[entity]()
}
