"use client"

import { SignUp } from "@clerk/nextjs"

export default function CandidateSignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        path="/auth/candidate/sign-up"
        routing="path"
        signInUrl="/auth/candidate/sign-in"
        fallbackRedirectUrl="/protected"
      />
    </div>
  )
}
