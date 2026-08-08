export function useAdminDashboard() {
  return {
    data: {
      summary: { students: 120, attendance: 92, classes: 8 },
      totalStudents: 120,
      totalClasses: 8,
      averageAttendance: 92,
      studentsAtRisk: 4,
      monthlyAttendance: [
        { label: "Jan", value: 88 },
        { label: "Fev", value: 90 },
        { label: "Mar", value: 91 },
        { label: "Abr", value: 93 },
        { label: "Mai", value: 92 },
      ],
      totalLessons: 18,
      openAlerts: 3,
    },
    isPending: false,
  }
}

export function useProfessorDashboard() {
  return {
    data: {
      summary: { lessons: 6, students: 32, alerts: 2 },
      attendanceAverage: 92,
      myClasses: [{ id: "1", name: "SP-01" }, { id: "2", name: "CN-03" }],
      studentsAtRisk: [{ id: "s1" }, { id: "s2" }],
      monthlyAttendance: [
        { label: "Jan", value: 88 },
        { label: "Fev", value: 90 },
        { label: "Mar", value: 91 },
      ]
    },
    isPending: false
  }
}

export function useStudentDashboard() {
  return {
    data: {
      summary: { attendance: 95, lessons: 4, nextLesson: "Matemática" },
      attendance: { rate: 95, present: 19, total: 20 },
      nextLesson: { title: "Matemática", startsAt: "2026-08-01T14:00:00Z" }
    },
    isPending: false
  }
}
