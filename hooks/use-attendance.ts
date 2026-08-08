import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/fetcher"

type AttendanceByLesson = { id: string; student: { id: string; name: string }; status: string }
type AttendanceByStudent = { id: string; status: string; date: string }

export function useAttendanceByLesson(lessonId: string) {
  const query = useQuery({
    queryKey: ["attendance", "lesson", lessonId],
    queryFn: () => apiFetch<AttendanceByLesson[]>(`/api/lessons/${lessonId}/attendance`),
    enabled: Boolean(lessonId),
  })
  return { data: query.data, isPending: query.isPending }
}

export function useAttendanceByStudent(studentId?: string) {
  const query = useQuery({
    queryKey: ["attendance", "student", studentId ?? "ME"],
    queryFn: () => apiFetch<AttendanceByStudent[]>(`/api/attendance${studentId ? `?studentId=${studentId}` : ""}`),
  })
  return { data: query.data, isPending: query.isPending }
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: { lessonId: string; studentId: string; status: string }) =>
      apiFetch(`/api/lessons/${payload.lessonId}/attendance`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attendance"] }),
  })
  return {
    mutate: (payload: { lessonId: string; studentId: string; status: string }, options?: { onSuccess?: () => void }) =>
      mutation.mutate(payload, options),
    isPending: mutation.isPending,
  }
}

export function useCheckIn() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: {
      lessonId: string
      checkinMethod: "LOCATION" | "QR_CODE"
      latitude?: number
      longitude?: number
      qrCodeToken?: string
    }) => apiFetch("/api/attendance/checkin", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attendance"] }),
  })
  return {
    mutate: (
      payload: {
        lessonId: string
        checkinMethod: "LOCATION" | "QR_CODE"
        latitude?: number
        longitude?: number
        qrCodeToken?: string
      },
      options?: { onSuccess?: () => void },
    ) => mutation.mutate(payload, options),
    isPending: mutation.isPending,
  }
}
