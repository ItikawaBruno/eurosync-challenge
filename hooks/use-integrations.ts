export function useIntegrations() {
  return {
    data: [
      {
        id: "1",
        name: "Moodle",
        provider: "Moodle",
        baseUrl: "https://moodle.euro-sync.example",
        status: "ACTIVE",
      },
    ],
    isPending: false,
  }
}
