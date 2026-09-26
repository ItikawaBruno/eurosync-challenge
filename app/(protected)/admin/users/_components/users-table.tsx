"use client"

import { useState } from "react"
import { Eye, Pencil, UserMinus } from "lucide-react"
import { DataTable, type Column } from "@/components/platform/ui/data-table"
import { Button } from "@/components/platform/ui/button"
import { RoleBadge, StatusBadge } from "@/components/platform/ui/status-badge"
import { TableSkeleton } from "@/components/platform/ui/loading"
import { AppModal, useOverlayState, type OverlayState } from "@/components/platform/ui/app-modal"
import { Input } from "@/components/platform/ui/forms"
import { useUsers, useUpdateUser, useDeleteUser, useCreateUser } from "@/hooks/use-user"
import type { UserRole } from "@/types/platform"

type ApiUser = { id: string; name: string; email: string; role: string; isActive: boolean }

export function UsersTable() {
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>()
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<ApiUser | null>(null)

  const viewModal = useOverlayState()
  const editModal = useOverlayState()
  const deleteModal = useOverlayState()
  const createModalState = useOverlayState()

  const { data: users, isPending } = useUsers(roleFilter)
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const [editName, setEditName] = useState("")
  const [createName, setCreateName] = useState("")
  const [createEmail, setCreateEmail] = useState("")
  const [createRole, setCreateRole] = useState<UserRole>("STUDENT")

  const filtered = (users ?? []).filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { createModalState.open() }
  const openView = (u: ApiUser) => { setSelected(u); viewModal.open() }
  const openEdit = (u: ApiUser) => { setSelected(u); setEditName(u.name); editModal.open() }
  const openDelete = (u: ApiUser) => { setSelected(u); deleteModal.open() }
  
  const handleCreate = () => {
    if (!createName.trim() || !createEmail.trim()) return
    createUser.mutate(
      { name: createName, email: createEmail, role: createRole },
      { onSuccess: () => { setCreateName(""); setCreateEmail(""); setCreateRole("STUDENT"); createModalState.close() } },
    )
  }
  
  const handleSave = () => { if (!selected) return; updateUser.mutate({ id: selected.id, name: editName }, { onSuccess: editModal.close }) }
  const handleDelete = () => { if (!selected) return; deleteUser.mutate(selected.id, { onSuccess: deleteModal.close }) }

  const columns: Array<Column<ApiUser>> = [
    { key: "name", header: "Usuario", cell: (u) => <div><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div> },
    { key: "role", header: "Perfil", cell: (u) => <RoleBadge role={u.role as UserRole} /> },
    { key: "status", header: "Status", cell: (u) => <StatusBadge label={u.isActive ? "Ativo" : "Inativo"} /> },
    {
      key: "actions", header: "Acoes", cell: (u) => (
        <div className="flex gap-2">
          <Button aria-label="Visualizar" size="icon" variant="ghost" onClick={() => openView(u as ApiUser)}><Eye className="h-4 w-4" /></Button>
          <Button aria-label="Editar" size="icon" variant="ghost" onClick={() => openEdit(u as ApiUser)}><Pencil className="h-4 w-4" /></Button>
          <Button aria-label="Desativar" size="icon" variant="ghost" onClick={() => openDelete(u as ApiUser)}><UserMinus className="h-4 w-4" /></Button>
        </div>
      )
    },
  ]

  return (
    <>
      <div className="grid gap-4">
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-sm md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Buscar por nome ou e-mail"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:max-w-sm"
          />
          <select
            aria-label="Filtrar por perfil"
            value={roleFilter ?? "ALL"}
            onChange={(e) => setRoleFilter(e.target.value === "ALL" ? undefined : e.target.value as UserRole)}
            className="min-w-[140px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-gray-800"
          >
            <option value="ALL">Todos</option>
            <option value="ADMIN">Admin</option>
            <option value="PROFESSOR">Professor</option>
            <option value="STUDENT">Aluno</option>
          </select>
        </div>
        {isPending
          ? <TableSkeleton rows={6} />
          : <DataTable columns={columns} data={filtered} getRowKey={(u) => u.id} />
        }
      </div>

      <AppModal
        state={createModalState}
        title="Adicionar usuario"
        footer={
          <>
            <Button variant="outline" onClick={createModalState.close}>Cancelar</Button>
            <Button variant="accent" onClick={handleCreate} disabled={createUser.isPending}>Criar</Button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Nome</span>
            <Input required value={createName} onChange={(e) => setCreateName(e.target.value)} />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium">E-mail</span>
            <Input required type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Perfil</span>
            <select
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value as UserRole)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
            >
              <option value="ADMIN">Admin</option>
              <option value="PROFESSOR">Professor</option>
              <option value="STUDENT">Aluno</option>
            </select>
          </label>
        </div>
      </AppModal>

      <AppModal
        state={viewModal}
        title="Detalhes do usuario"
        footer={<Button variant="outline" onClick={viewModal.close}>Fechar</Button>}
      >
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Nome</dt>
            <dd className="font-medium text-slate-800">{selected?.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">E-mail</dt>
            <dd className="font-medium text-slate-800">{selected?.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Perfil</dt>
            <dd>{selected ? <RoleBadge role={selected.role as UserRole} /> : null}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Status</dt>
            <dd><StatusBadge label={selected?.isActive ? "Ativo" : "Inativo"} /></dd>
          </div>
        </dl>
      </AppModal>

      <AppModal
        state={editModal}
        title="Editar usuario"
        footer={
          <>
            <Button variant="outline" onClick={editModal.close}>Cancelar</Button>
            <Button variant="accent" onClick={handleSave} disabled={updateUser.isPending}>Salvar</Button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Nome</span>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
          </label>
        </div>
      </AppModal>

      <AppModal
        state={deleteModal}
        title="Desativar usuario"
        footer={
          <>
            <Button variant="outline" onClick={deleteModal.close}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleteUser.isPending}>Desativar</Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Deseja desativar <strong>{selected?.name}</strong>? Esta acao pode ser revertida.
        </p>
      </AppModal>
    </>
  )
}

