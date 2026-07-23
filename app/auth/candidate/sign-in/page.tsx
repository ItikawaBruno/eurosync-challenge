"use client"

import { SignIn } from "@clerk/nextjs"
import { PageHeader } from "@/components/platform/layout/page-header"

export default function CandidateSignInPage() {
  return (
    <>
      <PageHeader title="Entrar" description="Acesse sua conta para visualizar sua área de aluno ou professor." />
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SignIn path="/auth/candidate/sign-in" routing="path" signUpUrl="/auth/candidate/sign-up" />
      </div>
    </>
  )
}
