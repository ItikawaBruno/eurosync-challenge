export function useLessons() {
  return { data: [{ id: "1", title: "Aula 1", startsAt: "08:00", endsAt: "09:00" }], isPending: false }
}

export function useLesson(id: string) {
  return { data: { id, title: `Aula ${id}` }, isPending: false }
}

export function useCreateLesson() {
  return { mutate: (_payload: any, options?: { onSuccess?: () => void }) => options?.onSuccess?.() }
}

export function useDeleteLesson() {
  return { mutate: (_payload: any, options?: { onSuccess?: () => void }) => options?.onSuccess?.() }
}

export function useUpdateLesson() {
  return { mutate: (_payload: any, options?: { onSuccess?: () => void }) => options?.onSuccess?.() }
}
