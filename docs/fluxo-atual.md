# Fluxo Atual do Sistema — euro-sync

> Documento gerado a partir da análise do código-fonte em 2026-08-08. Descreve o fluxo de autenticação, a estrutura de rotas, as entidades de dados e todas as ações que cada tipo de usuário pode executar hoje.

## 1. Visão geral

O euro-sync é uma plataforma de gestão educacional presencial construída em Next.js, com autenticação via **Clerk** e persistência em **Postgres** via **Prisma**. Não há cadastro self-service: **contas são provisionadas apenas por administradores** (individualmente ou via importação CSV).

```
app/
  layout.tsx                     ClerkProvider + QueryProvider (root)
  page.tsx                       Landing pública
  auth/candidate/sign-in/...     Tela de login (Clerk <SignIn/>)
  pos-login/page.tsx             Destino do Clerk: resolve o role e redireciona ao dashboard
  (protected)/                   Route group: NÃO aparece na URL
    layout.tsx                   Guarda de sessão (redireciona se não logado) + PlatformShell
    admin/...                    dashboard, classes, users, alerts, imports, lms-integration, reports
    professor/...                dashboard, classes, alerts, lessons/[id]/attendance, students/[id]
    student/...                  dashboard, classes, check-in, schedule, progress, notifications
  api/
    alerts, attendance, classes, dashboard, integrations, lessons, lms, me, tasks, users
components/platform/...          UI (sidebar, header, charts, telas de turma)
hooks/                           Hooks React Query que consomem /api/*
lib/
  auth-server.ts                 requireUser / requireRole / requireClassAccess / requireClassManage
  route-guard.tsx                guardRoleSegment (guarda de role por segmento de rota)
  clerk-provision.ts             provisionClerkUser / syncClerkRole / normalizeRole
  platform-navigation.tsx        navItems, roleHome, roleLabel
  attendance-stats.ts            cálculo de frequência
  task-stats.ts                  cálculo de adesão (tarefas + frequência)
  csv.ts                         parser de CSV para importação de usuários
proxy.ts                         clerkMiddleware() + allowlist de rotas públicas (faz o papel de middleware.ts)
prisma/schema.prisma             schema do banco
```

> **Nota arquitetural — as três camadas de autorização**:
>
> 1. `proxy.ts` (equivalente ao `middleware.ts`) exige sessão para tudo que não
>    estiver na allowlist de rotas públicas (`/` e `/auth/candidate/sign-in`).
>    As rotas de `/api` ficam **de fora** do `auth.protect()` de propósito:
>    `protect()` responde com redirect, e cliente de API espera 401/403 em JSON.
> 2. Os segmentos `admin`, `professor` e `student` têm cada um seu `layout.tsx`
>    com `guardRoleSegment`, que lê o role da **sessão** (via `requireUser()`) e
>    redireciona para o dashboard do role real se não bater. O role **não** é mais
>    derivado da URL (`roleFromPath` foi removido).
> 3. A autorização de dados fica na camada de API, via
>    `requireRole`/`requireClassAccess`/`requireClassManage`, com `withApi`
>    traduzindo para 401/403.
>
> O segmento `/protected` foi removido da URL por um route group `app/(protected)`.
> Como o prefixo comum deixou de existir, a allowlist do `proxy.ts` é o que garante
> que uma rota nova nasça privada por padrão.

---

## 2. Papéis de usuário (roles)

Definidos em `prisma/schema.prisma` (enum `UserRole`):

| Role | Status |
|---|---|
| **ADMIN** | Implementado — acesso total |
| **PROFESSOR** | Implementado — acesso às próprias turmas |
| **STUDENT** | Implementado — acesso aos próprios dados |
| **PARENT** | Existe no schema/enum e no provisionamento (CSV), mas **não tem nenhuma página, item de menu ou regra de API própria**. É redirecionado para o mesmo dashboard de STUDENT. Funcionalmente não implementado hoje. |

---

## 3. Fluxo de login e provisionamento de contas

1. Usuário acessa `/` (landing pública) → clica em "Entrar na plataforma" → vai para `/auth/candidate/sign-in`.
2. Tela de login usa o componente `<SignIn/>` do Clerk. **Não existe fluxo de sign-up** — a criação de contas é exclusiva do ADMIN, por dois caminhos:
   - `POST /api/users` — criação individual de usuário.
   - `POST /api/users/import` — importação em massa via CSV.
   - Ambos passam por `provisionClerkUser`: procura o usuário por e-mail (Prisma e depois Clerk); se não existir, cria no Clerk **sem senha** (`skipPasswordRequirement: true`, provavelmente com convite/passwordless) e grava o role em `publicMetadata.role`.
3. Após login bem-sucedido, o Clerk redireciona para `/pos-login` (`fallbackRedirectUrl`).
4. `app/(protected)/layout.tsx` checa a sessão; sem `userId`, redireciona de volta ao login.
5. `app/pos-login/page.tsx` chama `requireUser()`:
   - Busca o usuário no Postgres por `clerkId`.
   - Se ainda não existir localmente (primeiro acesso), provisiona: lê o Clerk `currentUser()`, extrai nome/e-mail, resolve o role a partir de `publicMetadata.role` (ou `ADMIN` se o e-mail bater com `SEED_ADMIN_EMAIL`, senão `STUDENT` por padrão), grava no Postgres e sincroniza de volta para o Clerk.
6. Com o role resolvido, o usuário é redirecionado para seu dashboard (`roleHome`):
   - ADMIN → `/admin/dashboard`
   - PROFESSOR → `/professor/dashboard`
   - STUDENT (e PARENT) → `/student/dashboard`

---

## 4. Rotas de página e quem acessa

| Rota | Propósito | Autorização real (via API) |
|---|---|---|
| `/` | Landing pública | pública |
| `/auth/candidate/sign-in` | Login | pública |
| `/pos-login` | Redireciona para o dashboard do role | sessão válida |
| `/admin/dashboard` | KPIs gerais (alunos, turmas, frequência média, alertas abertos) | ADMIN |
| `/admin/classes` | Lista/CRUD de turmas | GET livre; criar/editar ADMIN/PROFESSOR; deletar ADMIN |
| `/admin/classes/[id]` | Detalhe da turma (roster, tarefas, métricas) | dono da turma ou ADMIN |
| `/admin/users` | CRUD de usuários | ADMIN |
| `/admin/alerts` | Todos os alertas | leitura geral; ação varia por role |
| `/admin/imports` | Importação CSV de usuários | ADMIN |
| `/admin/lms-integration` | Painel de integração LMS (simulada) | ADMIN |
| `/admin/reports` | Relatórios agregados | ADMIN |
| `/professor/dashboard` | KPIs do professor | PROFESSOR |
| `/professor/classes` | Turmas do professor | PROFESSOR |
| `/professor/classes/[id]` | Detalhe da turma | dono da turma ou ADMIN |
| `/professor/alerts` | Alertas das turmas do professor | PROFESSOR |
| `/professor/lessons/[id]/attendance` | Controle de presença de uma aula | ADMIN, PROFESSOR |
| `/professor/students/[id]` | Perfil de um aluno | ADMIN, PROFESSOR |
| `/student/dashboard` | Próxima aula, frequência, alertas | STUDENT |
| `/student/classes` | Turmas em que o aluno está matriculado | STUDENT |
| `/student/classes/[id]` | Detalhe da turma (tarefas + métricas pessoais) | aluno matriculado |
| `/student/check-in` | Confirmar presença (localização ou QR code) | STUDENT |
| `/student/schedule` | Agenda de aulas | STUDENT |
| `/student/progress` | Progresso/frequência pessoal | STUDENT |
| `/student/notifications` | Avisos/alertas do aluno | STUDENT |

---

## 5. Entidades de dados (Prisma)

**Núcleo**
- `User` (id, clerkId, name, email, role, status)
- `Class` (turma) — tem um `teacher` (User), `students` (via `ClassStudent`), `lessons`, `tasks`, `alerts`
- `ClassStudent` — matrícula (junção turma↔aluno)
- `Task` — tarefa de turma, com `submissions`
- `TaskSubmission` — entrega de tarefa (junção tarefa↔aluno)
- `Lesson` — aula presencial (horário, local, `status` OPEN/CLOSED, `qrCodeToken`), com `attendances`
- `Attendance` — presença (junção aula↔aluno), `status` PRESENT/ABSENT/LATE/JUSTIFIED, `checkinMethod` LOCATION/QR_CODE
- `Alert` — alerta pedagógico (`status` OPEN/RESOLVED/IGNORED, `severity` LOW/MEDIUM/HIGH, `type` LOW_ATTENDANCE/LOW_ENGAGEMENT/DROPPING_PROGRESS/ABSENCE_SEQUENCE)

**Integração LMS (dados simulados/mock, sem ligação real com sistema externo)**
- `Integration`, `LmsSyncState`, `LmsSyncLog`
- `Lms*Record` (Course, Class, Student, Professor, Enrollment, Progress, Attendance, Activity, Grade, Completion)

---

## 6. Ações disponíveis por tipo de usuário

### 6.1 ADMIN
- **Usuários**: criar, editar nome, desativar (soft delete), listar/filtrar por role, importar em massa via CSV.
- **Turmas**: criar, editar, deletar (qualquer turma); matricular/desmatricular alunos em qualquer turma.
- **Tarefas de turma**: criar e deletar tarefas em qualquer turma; ver contagem de entregas.
- **Aulas/Presença**: criar, editar (abrir/fechar chamada) e deletar aulas de qualquer turma; editar o status de presença de qualquer aluno em qualquer aula.
- **Alertas**: ver todos; marcar como resolvido ou ignorado.
- **Relatórios/Dashboards**: ver KPIs globais (alunos, turmas, frequência média, alunos em risco, alertas abertos).
- **Integrações LMS (simuladas)**: sincronizar uma entidade ou todas, resetar todo o estado de sync, ver logs, inspecionar registros brutos por entidade.

### 6.2 PROFESSOR
- **Turmas**: criar turma; editar/deletar apenas as próprias turmas; matricular alunos nas próprias turmas.
- **Tarefas de turma**: criar/deletar tarefas apenas nas próprias turmas.
- **Aulas/Presença**: criar, editar e deletar aulas; editar presença de alunos aula a aula.
  > ⚠️ Ponto de atenção: as rotas de aulas e presença checam apenas o **role** (`ADMIN`/`PROFESSOR`), não se a aula pertence a uma turma do professor — diferente das rotas de tarefas/matrícula, que usam `requireClassManage` (checagem de posse). Um professor poderia, em tese, editar aulas/presença de turmas que não são suas.
- **Alertas**: ver e atualizar (resolver/ignorar) apenas os alertas das suas turmas.
- **Alunos**: ver perfil resumido de um aluno.
- **Dashboard**: ver KPIs das próprias turmas.

### 6.3 STUDENT
- **Turmas**: ver as turmas em que está matriculado.
- **Tarefas**: marcar/desmarcar a própria entrega de uma tarefa.
- **Presença**: fazer check-in em uma aula aberta, por geolocalização (se o navegador fornecer coordenadas) ou por código QR (token validado no servidor contra o `qrCodeToken` da aula). Não há validação geográfica real (raio permitido) no servidor — a indicação "dentro do local" é só visual no client.
- **Histórico**: ver o próprio histórico de presença e progresso/frequência.
- **Alertas/Avisos**: ver os próprios alertas; marcar como resolvido apenas os que são direcionados a si mesmo.
- **Agenda**: ver a própria agenda de aulas.

### 6.4 PARENT
- Role existente no banco/enum e reconhecido na importação CSV, mas **sem nenhuma tela, item de menu ou API dedicada** — hoje é redirecionado para o dashboard de STUDENT sem funcionalidade própria.

---

## 7. Funcionalidades em detalhe

### Group Tasks (tarefas de turma)
- Tela de detalhe da turma é compartilhada entre admin e professor (`ClassDetailContent`).
- ADMIN/professor dono: criam tarefa (título, descrição, prazo), deletam tarefa, veem contagem "entregues/total".
- Matrícula de alunos: modal lista alunos (`STUDENT`) ainda não matriculados na turma.
- Aluno: vê lista de tarefas do grupo, alterna estado "concluída/pendente" clicando no botão.
- **Métricas de adesão** (`GET /api/classes/[id]/metrics`):
  - `taskRate` = % de tarefas entregues (100% se não há tarefas).
  - `attendanceRate` = % de presenças.
  - Aluno é considerado **aderente** somente se `taskRate ≥ 80%` **e** `attendanceRate ≥ 75%`.
  - Série mensal de entregas (últimos 5 meses) usada em gráficos.

### Alertas de aluno
- **Não existe rota de criação de alerta na API** — só leitura e atualização de status. A geração de alertas (por baixa frequência, baixo engajamento, sequência de faltas etc.) não é uma rotina automática implementada no código hoje; presume-se populada via seed ou processo externo/futuro.
- ADMIN/PROFESSOR podem marcar como "Ignorado" ou "Resolvido" (com timestamp).
- STUDENT só pode marcar como resolvido os alertas em que ele mesmo é o aluno-alvo.

### Controle de presença (Attendance)
- Professor/admin: cria aula (título, horário, local); abre/fecha chamada mudando `status` da aula; edita presença aluno a aluno (PRESENT/ABSENT/LATE/JUSTIFIED).
- Aluno: na tela de check-in, identifica a aula "aberta" no momento; tenta obter geolocalização do navegador; se disponível, permite confirmar por localização; sempre permite confirmar por QR code (token). O servidor valida o token de QR contra o da aula, mas não valida a distância/raio geográfico do check-in por localização.
- Métricas de frequência usadas nos dashboards (taxa geral e série mensal).

### Importação de usuários / Integração LMS
- CSV aceita colunas em PT/EN (`name`/`nome`, `email`/`e-mail`, `role`/`perfil`), com sinônimos de role reconhecidos (ex.: professor/professora/teacher, aluno/aluna/estudante/student, responsavel/parent). Cada linha é provisionada individualmente, com relatório de sucesso/erro por linha.
- Painel de Integração LMS: **dados totalmente simulados**, sem integração real com sistema externo. Permite sincronizar tudo ou uma entidade isolada, resetar todo o estado, ver logs e inspecionar registros brutos (Cursos, Turmas, Alunos, Professores, Matrículas, Progresso, Presença, Atividades, Notas, Conclusões).

---

## 8. Pontos de atenção — status

| # | Ponto | Status |
|---|---|---|
| 1 | Autorização granular em Aulas/Presença | **Resolvido** — `requireLessonManage` em `lib/auth-server.ts` confirma a posse da turma em `PATCH/DELETE /api/lessons/[id]` e nas rotas de presença; `POST /api/lessons` usa `requireClassManage`. |
| 2 | Menu/sidebar derivado da URL | **Resolvido** — `roleFromPath` foi removido; o role vem de `requireUser()` no `app/(protected)/layout.tsx`, e cada segmento (`admin`, `professor`, `student`) tem layout com `guardRoleSegment`, que redireciona para o dashboard do role real. |
| 3 | Role PARENT | **Pendente** — continua sem tela/menu próprios; hoje é tratado como STUDENT (somente leitura pelas rotas). |
| 4 | Alertas não gerados automaticamente | **Resolvido** — `lib/alert-rules.ts` avalia frequência, faltas consecutivas, entrega de tarefas e queda de frequência mês a mês. Roda em `POST /api/alerts/generate` (botão "Gerar alertas") e automaticamente ao encerrar uma chamada. Cria alertas novos e encerra os que deixaram de se aplicar. |
| 5 | Check-in sem validação geográfica | **Resolvido** — `POST /api/attendance/checkin` valida matrícula, chamada aberta, janela da aula e distância (Haversine, `lib/geo.ts`) contra `locationRadiusM` da aula; atraso acima de 10 min registra `LATE`. |

### Decisões que acompanham essas mudanças

- **Token do QR**: gerado no servidor ao criar a aula (`lib/lesson-token.ts`) e omitido das respostas para STUDENT/PARENT. O professor vê o código na tela de chamada.
- **Lista de chamada**: `GET /api/lessons/[id]/attendance` devolve a turma inteira, com `PENDING` para quem ainda não tem registro. Encerrar a chamada persiste `ABSENT` para os pendentes (`lib/attendance-roster.ts`).
- **Cálculo de frequência**: `LATE` conta como comparecimento; `JUSTIFIED` sai do denominador em vez de penalizar.
- **Agendamento de aulas**: a tela de turma ganhou a seção "Aulas" (criar com horário, local, coordenadas opcionais e raio; abrir a chamada; excluir) — antes `useCreateLesson` não era usado por nenhuma tela.
