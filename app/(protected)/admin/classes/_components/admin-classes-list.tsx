"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Plus } from "lucide-react"
import { Button } from "@/components/platform/ui/button"
import { Card } from "@/components/platform/ui/card"
import { Input } from "@/components/platform/ui/forms"
import { StatusBadge } from "@/components/platform/ui/status-badge"
import { CardSkeleton } from "@/components/platform/ui/loading"
import { AppModal, useOverlayState } from "@/components/platform/ui/app-modal"
import { useClasses, useCreateClass, useUpdateClass, useDeleteClass, type ClassRecord } from "@/hooks/use-classes"
import { useUsers } from "@/hooks/use-user"

export function AdminClassesList() {
  const { data: classes, isPending } = useClasses()
  const { data: professors } = useUsers("PROFESSOR")
  const createClass = useCreateClass()
  const updateClass = useUpdateClass()
  const deleteClass = useDeleteClass()
  const modal = useOverlayState()
  const editModal = useOverlayState()
  const deleteConfirmModal = useOverlayState()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [teacherId, setTeacherId] = useState("")
  const [editingClass, setEditingClass] = useState<ClassRecord | null>(null)
  const [deletingClass, setDeletingClass] = useState<ClassRecord | null>(null)

  const handleCreate = () => {
    if (!name.trim() || !teacherId) return
    createClass.mutate(
      { name, description: description || undefined, teacherId },
      { onSuccess: () => { setName(""); setDescription(""); setTeacherId(""); modal.close() } },
    )
  }

  const handleEdit = () => {
    if (!editingClass || !name.trim()) return
    updateClass.mutate(
      { id: editingClass.id, name, description: description || undefined, teacherId: teacherId || undefined },
      { onSuccess: () => { setEditingClass(null); setName(""); setDescription(""); setTeacherId(""); editModal.close() } },
    )
  }

  const handleDelete = () => {
    if (!deletingClass) return
    deleteClass.mutate(
      deletingClass.id,
      { onSuccess: () => { setDeletingClass(null); deleteConfirmModal.close() } },
    )
  }

  const openEditModal = (cls: ClassRecord) => {
    setEditingClass(cls)
    setName(cls.name)
    setDescription(cls.description || "")
    setTeacherId(cls.teacher?.id ?? "")
    editModal.open()
  }

  const openDeleteModal = (cls: ClassRecord) => {
    setDeletingClass(cls)
    deleteConfirmModal.open()
  }

  if (isPending) return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  )

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(classes ?? []).map((cls) => (
          <Card className="p-5" key={cls.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#0f172b]">{cls.name}</h2>
                {cls.description && <p className="mt-1 text-sm text-muted-foreground">{cls.description}</p>}
              </div>
              <StatusBadge label={cls.status} />
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Professor</dt><dd className="font-medium text-gray-500">{cls.teacher?.name ?? "-"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Alunos</dt><dd className="font-medium text-gray-500">{cls._count?.students ?? 0}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Aulas</dt><dd className="font-medium text-gray-500">{cls._count?.lessons ?? 0}</dd></div>
            </dl>
            <div className="mt-5 flex gap-2">
              <Button className="flex-1" variant="outline" size="sm" onClick={() => openEditModal(cls)}>Editar</Button>
              <Button className="flex-1 text-red-600" variant="outline" size="sm" onClick={() => openDeleteModal(cls)}>Deletar</Button>
            </div>
            <Link href={`/admin/classes/${cls.id}`} className="mt-3 flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" >Abrir detalhes<ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Card>
        ))}
        <Card className="flex min-h-72 flex-col items-center justify-center border-dashed p-6 text-center">
          <Button size="icon" variant="secondary" onClick={modal.open}><Plus className="h-5 w-5" /></Button>
          <h2 className="mt-4 font-semibold text-[#0f172b]">Criar turma</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Configure professor, local, calendario e alunos vinculados.</p>
          <Button className="mt-4" variant="accent" onClick={modal.open}>Nova turma</Button>
        </Card>
      </div>

      <AppModal
        state={modal}
        title="Nova turma"
        footer={
          <>
            <Button variant="outline" onClick={modal.close}>Cancelar</Button>
            <Button variant="accent" onClick={handleCreate} disabled={createClass.isPending}>Criar</Button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Nome da turma</span>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Descricao</span>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Professor responsavel</span>
            <select
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
            >
              <option value="">Selecione um professor</option>
              {(professors ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        </div>
      </AppModal>

      <AppModal
        state={editModal}
        title="Editar turma"
        footer={
          <>
            <Button variant="outline" onClick={editModal.close}>Cancelar</Button>
            <Button variant="accent" onClick={handleEdit} disabled={updateClass.isPending}>Salvar</Button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Nome da turma</span>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Descricao</span>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Professor responsavel</span>
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
            >
              <option value="">Selecione um professor</option>
              {(professors ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        </div>
      </AppModal>

      <AppModal
        state={deleteConfirmModal}
        title="Deletar turma"
        footer={
          <>
            <Button variant="outline" onClick={deleteConfirmModal.close}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteClass.isPending}>Deletar</Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Voce esta deletando a turma <strong>{deletingClass?.name}</strong>. Esta acao nao pode ser desfeita.
        </p>
      </AppModal>
    </>
  )
}

