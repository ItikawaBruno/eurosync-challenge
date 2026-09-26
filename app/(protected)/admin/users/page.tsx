import { PageHeader } from "@/components/platform/layout/page-header"
import { UsersTable } from "./_components/users-table"

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader title="Usuarios" description="Gerencie contas, permissões e roles de acesso." />
      <UsersTable />
    </>
  )
}
