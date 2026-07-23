"use client"

import { SignUp } from "@clerk/nextjs"
import { PageHeader } from "@/components/platform/layout/page-header"

export default function CandidateSignUpPage() {
  return (
    <>
      <PageHeader title="Criar conta" description="Cadastre-se para acessar sua área de aluno ou professor." />
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SignUp path="/auth/candidate/sign-up" routing="path" signInUrl="/auth/candidate/sign-in" />
      </div>
    </>
  )
}
