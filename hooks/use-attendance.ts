export function useAttendanceByLesson() {
  return { data: [{ id: "1", student: { name: "Ana" }, status: "PRESENT" }], isPending: false }
}

export function useAttendanceByStudent() {
  return { data: [{ id: "1", status: "PRESENT", date: "2026-07-08" }], isPending: false }
}

export function useUpdateAttendance() {
  return { mutate: (_payload: any, options?: { onSuccess?: () => void }) => options?.onSuccess?.() }
}

export function useCheckIn() {
  return { mutate: (_payload: any, options?: { onSuccess?: () => void }) => options?.onSuccess?.() }
}
