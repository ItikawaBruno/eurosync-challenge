export function toastInfo(title: string, description: string) {
  if (typeof window !== "undefined") {
    window.alert(`${title}\n\n${description}`)
  }
}
