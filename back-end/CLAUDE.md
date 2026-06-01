# CLAUDE.md — Servijá

Fonte absoluta da verdade do projeto. Atualizada em: 27/05/2026.

---

## Visão Geral

SaaS de marketplace de serviços. Clientes publicam propostas; profissionais respondem com ofertas; há avaliações após conclusão.

- **Backend**: raiz do projeto — Node.js + Express 5 + TypeScript + Drizzle ORM + Turso (LibSQL)
- **Frontend**: `front-react/` — React 18 + Vite + React Router DOM 6 + TypeScript

---

## Arquitetura

### Backend (`src/`)

```
src/
├── app.ts                         # Express: CORS, cookie-parser, logging, rotas
├── server.ts                      # Entry point: conecta banco, sobe servidor
├── db/
│   ├── connection.ts              # Cliente Turso (LibSQL)
│   └── schema.ts                  # Drizzle schema (fonte de verdade do banco)
├── controllers/
│   ├── authController.ts          # register, login, me, update, logout
│   ├── professionalController.ts  # perfil e serviços do profissional
│   ├── proposalController.ts      # aceitar/recusar proposta (profissional)
│   └── client/
│       ├── ProposalController.ts  # CRUD de propostas (cliente)
│       └── RatingController.ts    # criar avaliação (cliente)
├── middleware/
│   └── authMiddleware.ts          # verifica JWT do cookie
└── routes/
    ├── authRoutes.ts              # montado em /auth
    ├── client/index.ts            # montado em /client
    └── professional/index.ts      # montado em /professionals
```

### Frontend (`front-react/src/`)

```
src/
├── App.tsx                        # React Router: define todas as rotas
├── main.tsx                       # Entry point Vite
├── contexts/AuthContext.tsx       # estado global de autenticação
├── services/api.ts                # todas as chamadas fetch para o backend
├── lib/types.ts                   # tipos TypeScript compartilhados (fonte de verdade frontend)
├── pages/
│   ├── Index.tsx                  # Landing page
│   ├── LoginUser.tsx              # Login
│   ├── Cadastro.tsx               # Registro
│   ├── Sobre.tsx
│   ├── client/                    # páginas do fluxo CLIENTE
│   └── professional/              # páginas do fluxo PROFISSIONAL
└── components/
    ├── BottomNav.tsx
    ├── Footer.tsx
    ├── Modal.tsx
    └── Toast.tsx
```

---

## Rotas da API

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/auth/register` | — | Cadastro de usuário |
| POST | `/auth/login` | — | Login, seta cookie `token` |
| GET | `/auth/me` | ✓ | Dados do usuário logado |
| PUT | `/auth/update` | ✓ | Atualizar perfil básico |
| POST | `/auth/logout` | ✓ | Limpa cookie |
| GET | `/professionals/` | — | Listar profissionais |
| GET | `/professionals/:id` | — | Perfil de profissional |
| POST | `/professionals/profile` | ✓ | Criar perfil profissional |
| PUT | `/professionals/profile` | ✓ | Atualizar perfil profissional |
| POST | `/professionals/services` | ✓ | Adicionar serviço |
| DELETE | `/professionals/services/:id` | ✓ | Remover serviço |
| GET | `/professionals/proposals` | ✓ | Listar propostas recebidas |
| POST | `/professionals/proposals/:id/accept` | ✓ | Aceitar proposta |
| POST | `/professionals/proposals/:id/reject` | ✓ | Recusar proposta |
| POST | `/client/proposals` | ✓ | Criar proposta |
| GET | `/client/proposals` | ✓ | Listar propostas do cliente |
| GET | `/client/proposals/:id` | ✓ | Detalhes de proposta |
| POST | `/client/proposals/:id/send` | ✓ | Enviar proposta a profissionais |
| PATCH | `/client/proposals/:id/start/:profId` | ✓ | Iniciar serviço |
| PATCH | `/client/proposals/:id/finish` | ✓ | Finalizar serviço |
| POST | `/client/ratings` | ✓ | Criar avaliação |

**Auth**: cookie `httpOnly` com JWT. Frontend usa `credentials: 'include'` em todos os fetches.

---

## Banco de Dados (Drizzle + Turso)

Tabelas: `users`, `professional_profiles`, `professional_services`, `proposals`, `proposal_professionals`, `ratings`.

**Status de `proposals` e `proposal_professionals`:**
`PENDENTE` | `ACEITA` | `RECUSADA` | `CANCELADA` | `EM_ANDAMENTO` | `FINALIZADA` | `AVALIADA`

**Tipos de usuário:** `CLIENTE` | `PROFISSIONAL`

> Sempre sincronizar `front-react/src/lib/types.ts` com `src/db/schema.ts` ao alterar enums.

---

## Tipos Frontend Importantes (`lib/types.ts`)

- `UserType` — `'CLIENTE' | 'PROFISSIONAL'`
- `ProposalStatus` — alinhado com schema acima
- `ToastState` — `{ message: string; isError: boolean }` (usado em `LoginUser.tsx`)
- `Toast` — `{ msg: string; isError: boolean }` (usado em `Cadastro.tsx`)
- `FormErrors` — `{ name?; email?; password?; userType? }`

---

## Comandos

```bash
# Backend
npm run dev          # tsx watch src/server.ts
npm run db:push      # aplicar migrations no Turso
npm run db:studio    # Drizzle Studio UI

# Frontend
cd front-react
npm run dev          # Vite dev server (porta 5173)
npm run build        # build produção
npm run test         # Vitest
npm run test:ui      # Vitest com interface visual
```

**Variáveis de ambiente necessárias (`.env`):**
```
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
JWT_SECRET=
NODE_ENV=development
```

---

## Regras do Projeto

1. **Nunca usar `@ts-nocheck`** — todos os arquivos devem ter tipos corretos.
2. **`lib/types.ts` é a fonte de verdade do frontend** — qualquer enum novo no schema deve ser espelhado aqui.
3. **Rádios e selects de tipo de usuário** devem sempre usar `'CLIENTE'`/`'PROFISSIONAL'` como valores de estado, nunca strings de display.
4. **Autenticação** é 100% via cookie `httpOnly` — nunca armazenar token em `localStorage`.
5. **Controllers duplicados** (`proposalController.ts` e `ratingController.ts` na raiz de `controllers/`) estão obsoletos; usar apenas os de `controllers/client/`.

---

## Histórico de Bugs Corrigidos

Ver [ALTERACOES.md](./ALTERACOES.md) para o log completo de alterações.

Principais bugs resolvidos em 27/05/2026:
- Import `Errors` inexistente → `FormErrors` em `Cadastro.tsx`
- Radio buttons enviavam sempre `PROFISSIONAL` (valores não batiam com a checagem)
- `AuthContext` tipava `login`/`cadastrar` como `Promise<void>` mas retornavam o usuário
- `ProposalStatus` no frontend divergia do schema do banco
- `tsconfig.json` do frontend incluía código do backend
- `setLocation` chamado sem `useState` em `professional/Home.tsx`

---

## Status Atual — atualizado em 27/05/2026

| Área | Status |
|------|--------|
| Backend (auth, CRUD, middleware) | Completo |
| Frontend (estrutura, rotas, contexto) | Completo |
| Integração Frontend ↔ Backend | Funcional |
| Login cliente / prestador | Funcionando |
| Logout (todas as páginas) | Corrigido |
| Listagem, criação, edição e exclusão de pedidos | Implementado |
| Banco de dados Turso (todas as tabelas e colunas) | Sincronizado |
| `tsc --noEmit` (frontend) | Passando sem erros |
| Testes de fluxo completo | Pendente |

## Rotas da API — adições em 27/05/2026

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| PUT | `/client/proposals/:id` | ✓ | Editar proposta (só `PENDENTE`) |
| DELETE | `/client/proposals/:id` | ✓ | Excluir proposta (`PENDENTE` ou `FINALIZADA`) |
