"use client"

import { SignIn } from "@clerk/nextjs"

export default function CandidateSignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        path="/auth/candidate/sign-in"
        routing="path"
        fallbackRedirectUrl="/pos-login"
      />
    </div>
  )
}
