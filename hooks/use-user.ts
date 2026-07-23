import type { ApiUser, UserRole } from "@/types/platform"

export function useMe() {
  return { data: { id: "me", name: "Eu", role: "ADMIN" as UserRole }, isPending: false }
}

export function useUsers(_roleFilter?: string) {
  return {
    data: [{ id: "1", name: "Ana", email: "ana@example.com", role: "STUDENT" as UserRole, status: "ACTIVE", isActive: true }],
    isPending: false,
  }
}

export function useUser(id: string) {
  return { data: { id, name: `Usuário ${id}`, email: `${id}@example.com`, role: "STUDENT" as UserRole }, isPending: false }
}

export function useUpdateUser() {
  return {
    mutate: (_payload: any, options?: { onSuccess?: () => void }) => options?.onSuccess?.(),
    isPending: false,
  }
}

export function useDeleteUser() {
  return {
    mutate: (_payload: any, options?: { onSuccess?: () => void }) => options?.onSuccess?.(),
    isPending: false,
  }
}

export function useCreateUser() {
  return {
    mutate: (_payload: any, options?: { onSuccess?: () => void }) => options?.onSuccess?.(),
    isPending: false,
  }
}

export type { ApiUser, UserRole }
