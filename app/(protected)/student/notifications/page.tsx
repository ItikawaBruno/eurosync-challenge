import { PageHeader } from "@/components/platform/layout/page-header"
import { NotificationsList } from "./_components/notifications-list"

export default function StudentNotificationsPage() {
  return (
    <>
      <PageHeader title="Notificações" description="Acompanhe avisos, comunicados e alertas da sua turma." />
      <NotificationsList />
    </>
  )
}
