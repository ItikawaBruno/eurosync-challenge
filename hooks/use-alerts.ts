export function useAlerts() {
  return {
    data: [
      {
        id: "1",
        status: "OPEN",
        severity: "HIGH",
        type: "LOW_ATTENDANCE",
        message: "Frequência abaixo do esperado nesta semana.",
        student: { name: "Ana Pereira" },
        class: { name: "Turma 8A" },
      },
    ],
    isPending: false,
    isError: false,
  }
}

export function useUpdateAlert() {
  return {
    mutate: (_payload: any, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.()
    },
    isPending: false,
  }
}
