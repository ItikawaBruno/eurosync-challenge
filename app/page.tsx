'use client'
import { useRouter } from "next/navigation";
import { BrandIcon } from "@/lib/platform-navigation";

export default function Home() {

  const router = useRouter();

  return (
        <main className="min-h-screen bg-[#002147] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-8 md:px-10">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFCC00] text-[#002147]"><BrandIcon className="h-5 w-5" /></span>
          <span className="font-semibold">Gestao Educacional Presencial</span>
        </div>
        <div className="max-w-3xl py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-yellow-200">Eurofarma Educacao Challenge</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">Plataforma corporativa para acoes educacionais presenciais.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200">Dashboards, turmas, presenca, progresso e indicadores em uma experiencia SaaS enterprise preparada para Clerk e controle futuro por role.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="inline-flex items-center justify-center rounded-full bg-[#FFCC00] px-5 py-2.5 text-sm font-semibold text-[#002147] transition-colors hover:bg-[#e6b800]"
              onClick={() => router.push("/auth/candidate/sign-in")}
            >
              Entrar na plataforma
            </button>
            <button
              className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              onClick={() => router.push("/auth/candidate/sign-up")}
            >
              Criar conta
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
