"use client"

import { PageHeader } from "@/components/platform/layout/page-header"
import { Card } from "@/components/platform/ui/card"
import { useClasses } from "@/hooks/use-classes"
import { ProfessorClassCard } from "./_components/professor-class-card"

export default function ProfessorClassesPage() {
  const { data: classes, isPending } = useClasses()
  const isEmpty = !isPending && (classes ?? []).length === 0

  return (
    <>
      <PageHeader title="Minhas Turmas" description="Acompanhe turmas, acesse detalhes e veja desempenho por classe." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isPending
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-3xl border bg-slate-100" />
            ))
          : (classes ?? []).map((cls) => <ProfessorClassCard key={cls.id} classGroup={cls} />)}
        {/* Sem isto a tela ficava totalmente em branco quando o professor nao
            tem turma — indistinguivel de erro de carregamento. */}
        {isEmpty && (
          <Card className="flex min-h-40 flex-col items-center justify-center p-6 text-center md:col-span-2 xl:col-span-3">
            <p className="text-sm text-muted-foreground">
              Voce ainda nao tem turmas sob sua responsabilidade.
            </p>
          </Card>
        )}
      </div>
    </>
  )
}
