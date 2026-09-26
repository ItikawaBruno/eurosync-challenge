# Plano de ação — ocultar `/protected` da URL e eliminar dados mocados

> Documento de execução. Escrito para ser entregue a um agente de IA (ou dev) e
> seguido na ordem. Cada fase tem escopo fechado, arquivos exatos e critério de
> aceite. Baseado no estado real do repo em `main` (commit `7639336`).

---

## 0. Contexto verificado (leia antes de mexer em qualquer coisa)

**Stack:** Next.js **16.2.10** (App Router, `reactCompiler: true`, Turbopack),
React 19.2.4, Clerk `@clerk/nextjs` 7.x, Prisma 7.9 + `@prisma/adapter-pg`,
TanStack Query 5, Tailwind 4.

> ⚠️ Esta versão do Next **não** é a que a maioria dos modelos conhece. O arquivo
> de middleware se chama **`proxy.ts`** (não `middleware.ts`) — veja
> `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.
> Leia `.../route-groups.md` antes da Fase 1. **Não** escreva código sem consultar
> `node_modules/next/dist/docs/` (regra do `AGENTS.md`).

### O que já está correto hoje (NÃO refazer)

- Autorização de verdade existe e está na camada de API: `lib/auth-server.ts`
  (`requireUser`, `requireRole`, `requireClassAccess`, `requireClassManage`,
  `requireLessonManage`) + `lib/api.ts` (`withApi` → 401/403/500).
- Cada segmento tem guard de role no layout: `app/protected/{admin,professor,student}/layout.tsx`
  chamam `guardRoleSegment` (`lib/route-guard.tsx`).
- **A lista de usuários já vem 100% do banco**: `app/api/users/route.ts` (Prisma
  `user.findMany`) → `hooks/use-user.ts` → `app/protected/admin/users/_components/users-table.tsx`.
  Não há array mocado ali. O mesmo vale para turmas, aulas, alertas, presenças,
  tarefas e métricas de turma (`app/api/classes/[id]/metrics/route.ts`).
- Cálculos agregados já são derivados do banco em `lib/attendance-stats.ts`,
  `lib/task-stats.ts` e `lib/alert-rules.ts`.

### O que realmente está mocado / falso (inventário fechado)

| # | Arquivo | Linha | Problema |
|---|---------|-------|----------|
| M1 | `app/protected/admin/dashboard/_components/admin-dashboard-sections.tsx` | 26 | `EngagementBarChart` com array literal `[{Moodle:78},{Aulas:86},{Avisos:72},{Atividades:81}]` |
| M2 | `app/protected/professor/dashboard/_components/professor-dashboard-content.tsx` | 33 | `EngagementBarChart` com array literal `[{SP-01:86},{CN-03:74},{Atividades:81}]` |
| M3 | `app/protected/admin/dashboard/_components/admin-kpi-cards.tsx` | 15, 17, 18 | `trendLabel="+8%"`, `"+3%"`, `"-2"` — variações inventadas |
| M4 | `app/protected/admin/dashboard/_components/admin-kpi-cards.tsx` | 17 | `description="ultimos 30 dias"` mas `averageAttendance` é **desde sempre** (sem filtro de data) |
| M5 | `app/protected/professor/dashboard/_components/professor-dashboard-content.tsx` | 26 | "Proximas aulas / nos proximos 7 dias" usa `useLessons()` sem filtro — `GET /api/lessons` ordena `startsAt: "desc"` e devolve **todas**, inclusive passadas |
| M6 | `app/protected/student/schedule/_components/schedule-list.tsx` | — | "Proximas aulas" com o mesmo problema de M5 |
| M7 | `components/platform/ui/forms.tsx` | 23 | `FilterBar` renderiza um `<input>` decorativo sem `value`/`onChange` — não filtra nada |
| M8 | `app/protected/admin/reports/_components/reports-panel.tsx` | 37-41 | Botões "Periodo", "Turma", "Status", "CSV", "PDF" sem `onClick` |
| M9 | `components/platform/layout/app-header.tsx` | 45-50 | Busca global decorativa, sem handler |
| M10 | `app/protected/admin/users/_components/users-table.tsx` | 62 | Botão "Visualizar" (olho) sem `onClick` |
| M11 | `components/platform/charts/platform-charts.tsx` | — | Nenhum dos 3 gráficos tem estado vazio: com `data=[]` renderiza um card em branco (parece bug/dado faltando) |
| M12 | vários | — | `(cls as any)._count`, `(dashboard as any)?.…` — casts para `any` escondem o contrato real do banco |

### Bug encontrado de graça

`app/protected/student/dashboard/_components/student-dashboard-content.tsx:31`
aponta para `href="/student/check-in"` — **hoje isso é 404** (falta o prefixo
`/protected`). Depois da Fase 1 esse link passa a ser o correto. Não "conserte"
adicionando `/protected`; a Fase 1 resolve.

---

## Fase 0 — Pré-requisitos (fazer ANTES de tocar em código)

Ordem obrigatória. Se qualquer item falhar, pare e resolva antes de seguir.

1. **Branch de trabalho.** `main` está limpo. Criar `git checkout -b feat/rotas-limpas-dados-reais`.
2. **Banco de pé com dados.** `docker compose up -d`, confirmar `DATABASE_URL` no
   `.env`, rodar `npx prisma migrate deploy` e `npx tsx prisma/seed.ts`.
   Sem dados no banco não é possível distinguir "mock removido com sucesso" de
   "quebrei a query" — os dois mostram zero.
3. **Baseline verde.** Rodar e guardar a saída de:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npm run build`

   Qualquer erro **pré-existente** deve ser anotado agora, para não ser confundido
   com regressão depois.
4. **Baseline visual.** Logar com os 3 perfis (ADMIN via `SEED_ADMIN_EMAIL`,
   PROFESSOR e STUDENT do seed) e printar: dashboard, turmas, usuários, relatórios,
   agenda, progresso, avisos. São 3 × ~7 telas. Esses prints são o gabarito de
   comparação da Fase 3.
5. **Ler a documentação da versão** (regra do `AGENTS.md`):
   - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route-groups.md`
   - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
   - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md`
6. **Decidir e registrar a política de métricas** (isso é decisão de produto, não
   de código) — ver Fase 2, seção 2.2. Sem essa decisão a Fase 2 empaca.

---

## Fase 1 — Ocultar `/protected` da URL

**Objetivo:** `/protected/admin/dashboard` → `/admin/dashboard`. A palavra
"protected" desaparece da barra de endereços, dos breadcrumbs e de qualquer link,
**sem** perder nenhum layout nem nenhum guard de role.

**Abordagem:** *Route Group* do Next — renomear a pasta `app/protected` para
`app/(protected)`. Parênteses = pasta organizacional que **não entra na URL**, e o
`layout.tsx` de dentro continua valendo. É a solução nativa, sem rewrite, sem
redirect, sem custo de runtime.

> Alternativa rejeitada: `rewrite` no `proxy.ts`. Mantém `/protected` como URL
> canônica interna, duplica o espaço de rotas, e o Clerk/`redirect()` continuariam
> vazando o prefixo. Não use.

### 1.1 Mover a pasta (com histórico de git preservado)

```bash
git mv app/protected "app/(protected)"
```

Resultado dos segmentos:

| Antes | Depois |
|-------|--------|
| `/protected/admin/dashboard` | `/admin/dashboard` |
| `/protected/professor/classes/[id]` | `/professor/classes/[id]` |
| `/protected/student/check-in` | `/student/check-in` |
| `/protected/professor/lessons/[id]/attendance` | `/professor/lessons/[id]/attendance` |

`app/(protected)/layout.tsx` permanece layout aninhado do grupo (o root layout
continua sendo `app/layout.tsx` — **não** é caso de múltiplos root layouts, então
não há full page reload entre grupos).

### 1.2 Resolver a colisão de rota — passo que quase todo mundo esquece

`app/protected/page.tsx` (que só faz `requireUser()` + `redirect(roleHome[role])`)
viraria `app/(protected)/page.tsx`, que resolve para **`/`** — colidindo com
`app/page.tsx` (a landing). Isso é erro de build, não warning.

Solução:

1. `git rm "app/(protected)/page.tsx"`
2. Criar **`app/pos-login/page.tsx`** (fora do grupo, sem shell):

```tsx
import { redirect } from "next/navigation"
import { requireUser } from "@/lib/auth-server"
import { roleHome } from "@/lib/platform-navigation"

export default async function PosLoginPage() {
  const user = await requireUser()
  redirect(roleHome[user.role] ?? roleHome.STUDENT)
}
```

3. Em `app/auth/candidate/sign-in/[[...rest]]/page.tsx`, trocar
   `fallbackRedirectUrl="/protected"` → `fallbackRedirectUrl="/pos-login"`.

### 1.3 Atualizar todas as referências a `/protected`

Lista completa e verificada — são 7 arquivos de código:

| Arquivo | O que mudar |
|---------|-------------|
| `lib/platform-navigation.tsx` | as 16 entradas de `navItems` (linhas 25-42) e as 4 de `roleHome` (53-56): remover o prefixo `/protected` |
| `app/auth/candidate/sign-in/[[...rest]]/page.tsx` | `fallbackRedirectUrl` → `/pos-login` (item 1.2) |
| `app/(protected)/admin/classes/_components/admin-classes-list.tsx` | linha 100: `/admin/classes/${cls.id}` |
| `app/(protected)/professor/classes/_components/professor-class-card.tsx` | linha 22: `/professor/classes/${classGroup.id}` |
| `app/(protected)/student/classes/_components/student-classes-list.tsx` | linha 35: `/student/classes/${cls.id}` |
| `components/platform/classes/class-lessons-section.tsx` | linha 106: `/professor/lessons/${lesson.id}/attendance` |
| `components/platform/layout/app-header.tsx` | `breadcrumbFromPath`: remover o `.filter((part) => part !== "protected")` — virou código morto |

Verificação: `grep -rn "/protected" app components lib hooks types` deve retornar
**zero** linhas em código (só `docs/` até o passo 1.5).

### 1.4 Endurecer a proteção no `proxy.ts` (recomendado, não opcional)

Hoje `proxy.ts` só faz `clerkMiddleware()` sem nenhuma checagem — quem barra o
anônimo é `app/(protected)/layout.tsx`. Isso funciona, mas o prefixo comum
`/protected` era a única pista de "tudo aqui é privado"; sem ele, uma rota nova
criada fora do grupo passa a ser pública por acidente.

Adicionar defesa em profundidade (mantendo o `matcher` atual, que já cobre tudo):

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/candidate/sign-in(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) await auth.protect()
})
```

Regras: a lista é de **rotas públicas** (allowlist), nunca de privadas. Rotas de
API continuam cobertas pelo `matcher` existente e mantêm seus `requireRole`.
Confirmar a assinatura de `auth.protect()` na versão instalada do Clerk antes de
commitar.

### 1.5 Atualizar a documentação

`docs/fluxo-atual.md` cita `/protected` em ~25 linhas (36, 60-68, 78-99, 188).
Atualizar a tabela de rotas, o passo 3-5 do fluxo de login (agora `/pos-login`) e
a nota arquitetural. Documento desatualizado é dívida, não histórico.

### ✅ Critério de aceite da Fase 1

- `npm run build` passa; `npx tsc --noEmit` e `npm run lint` sem regressão.
- Login com ADMIN → cai em `/admin/dashboard`. PROFESSOR → `/professor/dashboard`.
  STUDENT → `/student/dashboard`. Nenhuma URL contém "protected".
- Todo item do menu lateral navega e fica com o estado "ativo" correto
  (`app-sidebar.tsx` compara `pathname` com `item.href` — se o href estiver errado,
  o item nunca acende; isso é o teste).
- Breadcrumb não mostra mais "Protected".
- Deep links funcionam: turma, detalhe de aula, presença, perfil de aluno.
- STUDENT tentando `/admin/dashboard` é redirecionado para `/student/dashboard`
  (`guardRoleSegment`) — **teste explicitamente**, é o guard mais fácil de quebrar
  numa mudança de rotas.
- Anônimo em `/admin/dashboard` cai no sign-in.
- O botão "Confirmar presenca" do dashboard do aluno agora funciona (era 404).

---

## Fase 2 — Zero mock: tudo do banco

**Regra que vale para todo o restante do plano:** nenhum número, rótulo, série ou
linha de tabela pode existir no cliente sem ter vindo de uma query Prisma. Se um
indicador **não é derivável do schema atual**, ele é **removido** — não estimado,
não chumbado, não aproximado. Um card a menos é honesto; um card com número
inventado é mentira em produto de gestão educacional.

### 2.1 Engajamento real (M1, M2)

O schema suporta engajamento de verdade: `Task` + `TaskSubmission` +
`ClassStudent`. A taxa por turma é
`submissões / (nº de tarefas × nº de alunos) × 100` — mesma semântica de
`taskDeliveryRate` em `lib/task-stats.ts`, que já é usada em
`app/api/classes/[id]/metrics/route.ts`. Reaproveite a função; não duplique a fórmula.

- `app/api/dashboard/admin/route.ts`: adicionar ao payload
  `engagementByClass: { label: string; value: number }[]` — uma entrada por turma
  com ao menos 1 tarefa, ordenado por valor desc, limitado a 5.
- `app/api/dashboard/professor/route.ts`: idem, restrito a `teacherId: user.id`
  (o `where` já existe no handler).
- `hooks/use-dashboard.ts`: incluir o campo nos tipos `AdminDashboard` e
  `ProfessorDashboard` (eles já são tipados — mantenha assim).
- Consumir em M1 e M2, apagando os arrays literais.
- Turma com `tasks.length === 0` não entra na série (numerador e denominador
  zerados não significam 0% de engajamento — significa "não medido").

### 2.2 Tendências dos KPIs (M3, M4) — requer a decisão da Fase 0.6

`trendLabel` hoje é ficção. O que o schema permite calcular de fato:

- **Total de alunos** → derivável. `User.createdAt` existe: delta =
  (STUDENT ACTIVE criados no mês corrente) − (criados no mês anterior).
  Rótulo honesto: `+N no mes`.
- **Presença média** → derivável. `monthlyAttendanceSeries` já devolve a série
  mensal; a variação é `último bucket − penúltimo`, em **pontos percentuais**.
  Rótulo: `+Npp`, nunca `+N%` (confundir pp com % é erro de leitura clássico).
  Corrigir também M4: ou o card passa a filtrar de fato os últimos 30 dias na
  query, ou a descrição muda para "desde o inicio". **Não deixe as duas
  divergindo.**
- **Alunos em risco** → **não derivável**. `studentsAtRisk` é contado a partir de
  alertas OPEN *agora*; não existe snapshot histórico. Duas saídas legítimas:
  (a) remover `trend`/`trendLabel` do card; ou (b) trocar a métrica por
  "novos alunos sinalizados no mes" (distinct `studentId` em `Alert` por
  `createdAt`), que é calculável — e então mudar o título do card para refletir
  isso. **Escolha uma e registre no PR.** Não invente snapshot.

Onde o número não for calculável e a opção escolhida for (a): apague as props.
`MetricCard` (`components/platform/ui/metric-card.tsx`) já trata `trend`/
`trendLabel` como opcionais — não precisa mexer no componente.

### 2.3 "Próximas aulas" de verdade (M5, M6)

`GET /api/lessons` hoje: `orderBy: { startsAt: "desc" }`, sem filtro de data —
ou seja, "Próximas aulas" está exibindo as **mais recentes do passado**.

- `app/api/lessons/route.ts`: aceitar `?upcoming=true` (e opcionalmente
  `?days=7`), aplicando `startsAt: { gte: new Date() }` e
  `orderBy: { startsAt: "asc" }`. Preservar intacto o filtro de role já existente
  (`classFilter`) e a remoção de `qrCodeToken` para STUDENT/PARENT — **esse
  strip é segurança, não formatação**.
- `hooks/use-lessons.ts`: `useLessons` passa a aceitar opções e refletir os
  parâmetros na `queryKey` (senão o React Query serve cache errado entre as duas
  visões).
- M5 usa `upcoming` + `days=7` e o card passa a mostrar a contagem da própria
  resposta (a descrição "nos proximos 7 dias" só então fica verdadeira).
- M6 (`schedule-list.tsx`) usa `upcoming`.

### 2.4 Filtros e exportações: funcionar ou sair da tela (M7, M8, M9, M10)

Controle que não faz nada é pior que ausência de controle — o usuário conclui que
o sistema está quebrado. Para cada item, **implementar ou remover**; nada fica
decorativo.

- **M7 `FilterBar`**: transformar em componente controlado (`searchValue`,
  `onSearchChange`) ou tirar a prop `searchPlaceholder`. Referência de como fazer
  certo no próprio repo: `users-table.tsx` já filtra com `Input` + `useState`.
- **M8 relatórios**:
  - "Periodo" / "Turma" / "Status" → virar filtros reais que vão até a API
    (`/api/dashboard/admin` e `/api/classes` passam a aceitar `from`, `to`,
    `classId`, `status`), **ou** sair.
  - "CSV" → implementar de fato: serializar as linhas já vindas do banco. Existe
    parser em `lib/csv.ts` (`parseUserCsv`), mas **não existe serializador** —
    escrever `toCsv(rows)` no mesmo arquivo, com escape de `"` e `,`.
  - "PDF" → não há biblioteca de PDF no `package.json`. **Remover o botão.** Não
    adicione dependência nova neste PR.
- **M9 busca global do header**: sem endpoint de busca no projeto. Remover o
  campo; busca global é feature própria, com escopo e PR próprios.
- **M10 botão "Visualizar"** em `users-table.tsx`: abrir um `AppModal` com os
  dados que a própria `GET /api/users` já devolve, ou remover o botão.

### 2.5 Estado vazio nos gráficos (M11)

`AttendanceLineChart`, `CountBarChart` e `EngagementBarChart` em
`components/platform/charts/platform-charts.tsx` renderizam um card vazio quando
`data=[]`. Com mocks removidos isso vai acontecer de verdade (banco novo, turma
sem tarefa). Adicionar em cada um: se `data.length === 0`, mensagem
"Sem dados no periodo." no lugar das barras. Banco vazio precisa **parecer** banco
vazio, não bug.

### 2.6 Tirar os `as any` da fronteira de dados (M12)

Os casts (`(cls as any)._count`, `(dashboard as any)?.attendance?.rate`,
`(lesson as any).locationName`) são o que permitiu o mock passar batido: com `any`
o TypeScript não acusa campo que não existe. Tipar os retornos das rotas —
preferencialmente derivando de `types/platform.ts` e dos tipos do Prisma — e
remover os casts nos arquivos tocados por esta fase. Não é refator cosmético: é o
mecanismo que impede o mock de voltar.

### ✅ Critério de aceite da Fase 2

- `grep -rnE "value: [0-9]+|trendLabel=" app components` retorna **zero**
  ocorrência de literal fora de tipo/comentário.
- Nenhum `as any` nos arquivos alterados nesta fase.
- **Teste do banco vazio:** apontar para um banco sem seed. Toda tela renderiza
  com `0` / "Sem dados", sem crash, sem número fantasma. É o teste definitivo de
  que nada é mocado.
- **Teste de mutação:** adicionar uma `TaskSubmission` ou uma `Attendance` pelo
  app e conferir que o número do dashboard **muda**. Se não muda, o valor não vem
  do banco.
- Nenhum botão/input sem handler nas telas tocadas.
- Números conferem contra SQL direto no banco (frequência média, total de alunos,
  alertas abertos).

---

## Fase 3 — Validação final

1. `npx tsc --noEmit` · `npm run lint` · `npm run build` — comparar com o baseline
   da Fase 0.3.
2. Matriz de navegação: 3 roles × todas as rotas do menu + deep links. Comparar
   com os prints da Fase 0.4 — layout idêntico, só a URL e os números mudam.
3. Matriz de autorização (a que mais importa depois de mexer em rotas):

   | Ator | Alvo | Esperado |
   |------|------|----------|
   | anônimo | `/admin/dashboard` | redirect p/ sign-in |
   | STUDENT | `/admin/users` | redirect p/ `/student/dashboard` |
   | STUDENT | `GET /api/users` | 403 |
   | PROFESSOR | `/admin/dashboard` | redirect p/ `/professor/dashboard` |
   | PROFESSOR | turma de outro professor | 403 |
   | STUDENT | `GET /api/lessons` | resposta **sem** `qrCodeToken` |

4. Rodar `/code-review high` no diff antes de abrir o PR.
5. Commits separados por fase (`Fase 1` = movimentação de rotas; `Fase 2` = dados
   reais). Misturar `git mv` de 80 arquivos com mudança de lógica torna o diff
   impossível de revisar.

---

## Riscos e armadilhas conhecidas

| Risco | Mitigação |
|-------|-----------|
| `app/(protected)/page.tsx` colide com `app/page.tsx` em `/` | Fase 1.2 — deletar e criar `/pos-login` |
| Link do menu com href errado: item nunca fica "ativo", e ninguém nota | Clicar em **todos** os 16 itens (Fase 1 aceite) |
| Clerk continua mandando para `/protected` (404) | `fallbackRedirectUrl` **e** checar `NEXT_PUBLIC_CLERK_*` no `.env` |
| Rota nova nasce pública porque perdeu o prefixo `/protected` | Allowlist no `proxy.ts` (Fase 1.4) |
| Remover mock → tela zerada → alguém "conserta" recolocando mock | Estado vazio explícito (2.5) + teste de banco vazio |
| Cache do React Query servindo lista errada entre "todas" e "próximas" aulas | `queryKey` precisa incluir os parâmetros (2.3) |
| `.next/` com cache velho depois do `git mv` | `rm -rf .next` antes de validar |
| Escrever código de Next 15 (ex.: criar `middleware.ts`) | Ler `node_modules/next/dist/docs/` (Fase 0.5) — `AGENTS.md` |

---

## Anexo — prompt pronto para o agente

> Você vai trabalhar no repo `euro-sync` (Next.js 16.2.10 + Clerk + Prisma 7).
> Leia `AGENTS.md`: esta versão do Next tem breaking changes, o middleware se
> chama `proxy.ts`, e você **deve** consultar `node_modules/next/dist/docs/` antes
> de escrever código.
>
> Siga `docs/plano-acao-rotas-e-dados-reais.md` na ordem, uma fase por vez.
> Pare no fim de cada fase e me mostre o resultado do critério de aceite antes de
> seguir para a próxima. Faça um commit por fase.
>
> Escopo, resumido: (1) tirar `/protected` da URL via route group `app/(protected)`,
> preservando todos os guards de role e resolvendo a colisão de `/`;
> (2) eliminar todo dado mocado — os 12 itens M1–M12 do inventário — de modo que
> todo número, série e lista venha de query Prisma.
>
> Regra dura: se um indicador não é derivável do schema atual, **remova o
> indicador**. Nunca estime, nunca chumbe, nunca aproxime. Na dúvida sobre as
> tendências dos KPIs (seção 2.2), pergunte antes de decidir.
>
> Não adicione dependências novas. Não mexa em `prisma/schema.prisma` sem me
> avisar. Não altere as regras de autorização em `lib/auth-server.ts`.
