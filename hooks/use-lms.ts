export function useLmsOverview() {
  return {
    data: {
      syncs: 3,
      pending: 1,
      courses: { count: 8, lastSync: "2024-05-12T09:30:00.000Z", status: "success" },
      classes: { count: 12, lastSync: "2024-05-10T15:00:00.000Z", status: "success" },
      students: { count: 320, lastSync: "2024-05-12T08:45:00.000Z", status: "success" },
      professors: { count: 18, lastSync: "2024-05-11T10:15:00.000Z", status: "success" },
      enrollments: { count: 280, lastSync: "2024-05-12T09:20:00.000Z", status: "success" },
      progress: { count: 1250, lastSync: "2024-05-12T09:10:00.000Z", status: "success" },
      attendance: { count: 640, lastSync: "2024-05-12T09:05:00.000Z", status: "success" },
      activities: { count: 154, lastSync: "2024-05-11T17:30:00.000Z", status: "success" },
      grades: { count: 780, lastSync: "2024-05-10T18:20:00.000Z", status: "success" },
      completions: { count: 90, lastSync: "2024-05-09T12:10:00.000Z", status: "success" },
    },
    isPending: false,
  }
}

export function useLmsSyncAll() {
  return {
    mutate: (_payload?: any, options?: { onSuccess?: () => void }) => options?.onSuccess?.(),
    isPending: false,
  }
}

export function useLmsReset() {
  return {
    mutate: (_payload?: any, options?: { onSuccess?: () => void }) => options?.onSuccess?.(),
    isPending: false,
  }
}

export function useLmsLogs() {
  return {
    data: [
      {
        id: "1",
        timestamp: "2024-05-12T09:30:00.000Z",
        action: "full_sync",
        entity: "courses",
        recordsProcessed: 8,
        status: "success",
        message: "Sincronização concluída com sucesso",
      },
    ],
    isPending: false,
  }
}

export function useLmsData(_entity: LmsSyncEntity) {
  return { data: [{ id: "1", name: "Moodle" }], isPending: false }
}

export function useLmsSyncEntity() {
  return {
    mutate: (_payload?: any, options?: { onSuccess?: () => void }) => options?.onSuccess?.(),
    isPending: false,
  }
}

export type LmsSyncEntity =
  | "courses"
  | "classes"
  | "students"
  | "professors"
  | "enrollments"
  | "progress"
  | "attendance"
  | "activities"
  | "grades"
  | "completions"
