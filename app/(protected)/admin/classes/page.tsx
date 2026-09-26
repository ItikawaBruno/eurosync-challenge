import { PageHeader } from "@/components/platform/layout/page-header"
import { AdminClassesList } from "./_components/admin-classes-list"

export default function AdminClassesPage() {
  return (
    <>
      <PageHeader title="Turmas" description="Gerencie turmas, edite dados e acesse matriculas." />
      <AdminClassesList />
    </>
  )
}
