import type { UserRole } from "@/types/platform"

declare module "@clerk/types" {
  interface UserPublicMetadata {
    role?: UserRole
  }
}

export {}
