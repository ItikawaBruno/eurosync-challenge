import { PageHeader } from "@/components/platform/layout/page-header"
import { CheckInPanel } from "./_components/check-in-panel"

export default function StudentCheckInPage() {
  return (
    <>
      <PageHeader title="Check-in" description="Confirme sua presença por localização ou QR Code." />
      <CheckInPanel />
    </>
  )
}
