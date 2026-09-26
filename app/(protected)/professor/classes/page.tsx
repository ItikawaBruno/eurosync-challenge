"use client"

import { PageHeader } from "@/components/platform/layout/page-header"
import { useClasses } from "@/hooks/use-classes"
import { ProfessorClassCard } from "./_components/professor-class-card"

export default function ProfessorClassesPage() {
  const { data: classes, isPending } = useClasses()

  return (
    <>
      <PageHeader title="Minhas Turmas" description="Acompanhe turmas, acesse detalhes e veja desempenho por classe." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isPending ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-3xl border bg-slate-100" />
          ))
        ) : (
          (classes ?? []).map((cls) => <ProfessorClassCard key={cls.id} classGroup={cls} />)
        )}
      </div>
    </>
  )
}
