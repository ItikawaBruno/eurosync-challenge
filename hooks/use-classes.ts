export function useClasses() {
  return {
    data: [
      {
        id: "1",
        name: "Turma 8A",
        description: "Turma piloto",
        status: "ACTIVE",
        _count: { students: 24, lessons: 18 },
      },
    ],
    isPending: false,
  }
}

export function useClass(id: string) {
  return {
    data: {
      id,
      name: `Turma ${id}`,
      description: "Turma piloto",
      status: "ACTIVE",
      _count: { students: 24, lessons: 18 },
    },
    isPending: false,
  }
}

export function useCreateClass() {
  return {
    mutate: (_payload: any, options?: { onSuccess?: () => void }) => options?.onSuccess?.(),
    isPending: false,
  }
}

export function useUpdateClass() {
  return {
    mutate: (_payload: any, options?: { onSuccess?: () => void }) => options?.onSuccess?.(),
    isPending: false,
  }
}

export function useDeleteClass() {
  return {
    mutate: (_payload: any, options?: { onSuccess?: () => void }) => options?.onSuccess?.(),
    isPending: false,
  }
}

export function useAddClassStudents() {
  return {
    mutate: (_payload: any, options?: { onSuccess?: () => void }) => options?.onSuccess?.(),
    isPending: false,
  }
}
