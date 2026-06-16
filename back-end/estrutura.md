# CLAUDE.md — Servijá

Fonte absoluta da verdade do projeto. Atualizada em: 12/06/2026.

---

## Visão Geral

SaaS de marketplace de serviços. Clientes publicam serviços; profissionais respondem com propostas; há avaliações após conclusão.

- **Backend**: raiz do projeto — Node.js + Express 5 + TypeScript + Drizzle ORM + Turso (LibSQL)
- **Frontend**: `front-react/` — React 18 + Vite + React Router DOM 6 + TypeScript

---

## Arquitetura

### Backend (`src/`)

```
src/
├── app.ts                              # Express: CORS, cookie-parser, logging, rotas
├── server.ts                           # Entry point: conecta banco, sobe servidor
├── db/
│   ├── connection.ts                   # Cliente Turso (LibSQL)
│   └── schema.ts                       # Drizzle schema (fonte de verdade do banco)
├── controllers/
│   ├── authController.ts               # register, login, me, update, onboarding, upload foto, logout
│   ├── FavoritesController.ts          # favoritos de usuários e serviços
│   ├── client/
│   │   ├── ClientAuthController.ts     # auth específica do cliente
│   │   ├── ServiceController.ts        # CRUD de serviços publicados
│   │   ├── ProposalController.ts       # propostas recebidas pelo cliente
│   │   └── ratingController.ts         # criar/listar avaliações
│   └── professional/
│       ├── ProfessionalAuthController.ts
│       ├── professionalController.ts   # perfil e listagem de profissionais
│       ├── proposalController.ts       # enviar/aceitar/recusar propostas
│       ├── ServiceController.ts        # serviços do profissional
│       └── ratingController.ts         # avaliações do profissional
├── middleware/
│   ├── authMiddleware.ts               # verifica JWT do cookie
│   └── upload.ts                       # multer: uploads gerais e fotos de perfil
└── routes/
    ├── authRoutes.ts                   # montado em /auth
    ├── uploadRoutes.ts                 # montado em /api/upload
    ├── client/
    │   ├── authRoutes.ts               # montado em /client/auth
    │   └── index.ts                    # montado em /client
    └── professional/
        ├── authRoutes.ts               # montado em /professional/auth
        └── index.ts                    # montado em /professionals
```

### Frontend (`front-react/src/`)

```
src/
├── App.tsx                             # React Router: define todas as rotas
├── main.tsx                            # Entry point Vite
├── contexts/AuthContext.tsx            # estado global de autenticação + refreshUser
├── services/api.ts                     # todas as chamadas fetch para o backend
├── lib/
│   ├── types.ts                        # tipos TypeScript (fonte de verdade frontend)
│   └── onboardingOptions.ts            # listas pré-montadas do onboarding
├── pages/
│   ├── Index.tsx                       # Landing page
│   ├── Sobre.tsx
│   ├── NotFound.tsx
│   ├── onboarding/
│   │   └── OnboardingFlow.tsx          # wizard multi-etapas de perfil
│   ├── client/                         # fluxo CLIENTE
│   │   ├── LoginClient.tsx
│   │   ├── CadastroClient.tsx
│   │   ├── Home.tsx
│   │   ├── Services.tsx
│   │   ├── PostService.tsx
│   │   ├── Proposals.tsx
│   │   ├── Profile.tsx
│   │   └── Favorites.tsx
│   └── professional/                   # fluxo PROFISSIONAL
│       ├── LoginProfessional.tsx
│       ├── CadastroProfessional.tsx
│       ├── Home.tsx
│       ├── Proposals.tsx
│       ├── ServiceDetails.tsx
│       ├── SendProposal.tsx
│       ├── Profile.tsx
│       └── Favorites.tsx
└── components/
    ├── BottomNav.tsx
    ├── Footer.tsx
    ├── Modal.tsx
    ├── Toast.tsx
    ├── ProtectedRoute.tsx              # bloqueia rotas se não autenticado ou perfil incompleto
    └── OnboardingRoute.tsx             # permite acesso só com perfil incompleto
```

---

## Fluxo de Onboarding (perfil incompleto)

Ao fazer login, o backend verifica se o perfil está completo via `checkCompleteness()` em `authController.ts`. A resposta inclui `perfilIncompleto` e `missingFields`.

**Campos obrigatórios:**

| Tipo | Campos |
|------|--------|
| Todos | `foto`, `telefone`, `cpf`, `cidade`, `estado` |
| PROFISSIONAL | `profissao`, `experiencia`, `habilidades` (tabela `professional_profiles`) |
| CLIENTE | `tipo_cliente`, `preferencias_busca` (tabela `client_profiles`) |

**Etapas do wizard (frontend):**

1. **Dados pessoais** — só os campos que faltam; foto salva em `uploads/profile/cliente/` ou `uploads/profile/profissional/`
2. **Verificação de identidade** — tela simulada (SMS), sem implementação real
3. **Confirmação de documentos** — tela simulada, sem upload real
4. **Perfil específico** — profissional (profissão, experiência, habilidades) ou cliente (tipo + preferências)

Enquanto `perfilIncompleto === true`, o `ProtectedRoute` redireciona para `/client/onboarding` ou `/professional/onboarding`. O usuário não acessa o restante do site até concluir.

**Script de diagnóstico:** `scratch/check_users.ts` — lista profissionais com dados incompletos no console.

---

## Rotas da API

### Autenticação (`/auth`)

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/auth/register` | — | Cadastro de usuário |
| POST | `/auth/login` | — | Login; retorna `perfilIncompleto` e `missingFields` |
| GET | `/auth/me` | ✓ | Dados do usuário logado + status de completude |
| PUT | `/auth/update` | ✓ | Atualizar perfil básico |
| PUT | `/auth/onboarding` | ✓ | Salvar dados do onboarding (parcial ou completo) |
| POST | `/auth/profile/photo` | ✓ | Upload de foto de perfil (multer) |
| POST | `/auth/logout` | ✓ | Limpa cookie |

Também existem rotas espelhadas em `/client/auth/*` e `/professional/auth/*`.

### Upload (`/api/upload`)

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/api/upload/single` | ✓ | Upload de imagem única |
| POST | `/api/upload/multiple` | ✓ | Upload de até 5 imagens |

### Profissionais (`/professionals`)

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/professionals/` | — | Listar profissionais |
| GET | `/professionals/:id` | — | Perfil de profissional |
| POST | `/professionals/profile` | ✓ | Criar perfil profissional |
| PUT | `/professionals/profile` | ✓ | Atualizar perfil profissional |
| POST | `/professionals/services` | ✓ | Adicionar serviço |
| DELETE | `/professionals/services/:id` | ✓ | Remover serviço |
| GET | `/professionals/proposals` | ✓ | Listar propostas recebidas |
| POST | `/professionals/proposals` | ✓ | Enviar proposta |
| POST | `/professionals/proposals/:id/accept` | ✓ | Aceitar proposta |
| POST | `/professionals/proposals/:id/reject` | ✓ | Recusar proposta |
| POST | `/professionals/proposals/:id/complete` | ✓ | Marcar serviço como concluído |
| POST | `/professionals/ratings` | ✓ | Criar avaliação (profissional) |
| POST/GET | `/professionals/favorites/users` | ✓ | Favoritar/listar usuários |
| POST/GET | `/professionals/favorites/services` | ✓ | Favoritar/listar serviços |

### Cliente (`/client`)

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/client/services` | ✓ | Publicar serviço |
| GET | `/client/services` | ✓ | Listar meus serviços |
| GET | `/client/services/all` | ✓ | Listar todos os serviços |
| GET | `/client/proposals/received` | ✓ | Propostas recebidas |
| PATCH | `/client/proposals/:id/accept` | ✓ | Aceitar proposta |
| PATCH | `/client/proposals/:id/reject` | ✓ | Recusar proposta |
| POST | `/client/ratings` | ✓ | Criar avaliação |
| GET | `/client/professionals/:id/ratings` | ✓ | Avaliações de um profissional |
| POST/GET | `/client/favorites/users` | ✓ | Favoritar/listar usuários |
| POST/GET | `/client/favorites/services` | ✓ | Favoritar/listar serviços |

**Auth**: cookie `httpOnly` com JWT. Frontend usa `credentials: 'include'` em todos os fetches.

---

## Banco de Dados (Drizzle + Turso)

**Tabelas:** `users`, `professional_profiles`, `client_profiles`, `professional_services`, `proposal_professionals`, `ratings`, `favorites`, `favorite_services`.

**Status de `professional_services` e `proposal_professionals`:**
`PENDENTE` | `ACEITA` | `RECUSADA` | `CANCELADA` | `EM_ANDAMENTO` | `FINALIZADA` | `AVALIADA`

**Tipos de usuário:** `CLIENTE` | `PROFISSIONAL`

**Tipos de cliente (`client_profiles.tipo_cliente`):** `PF` | `CONSTRUTORA` | `IMOBILIARIA` | `CONDOMINIO` | `OUTRO`

> Sempre sincronizar `front-react/src/lib/types.ts` com `src/db/schema.ts` ao alterar enums.

---

## Uploads

```
uploads/
├── profile/
│   ├── cliente/          # fotos de perfil de clientes
│   └── profissional/     # fotos de perfil de profissionais
└── (outros arquivos)     # imagens de serviços etc.
```

O middleware `upload.ts` direciona automaticamente para o subdiretório correto quando a rota contém `/profile`.

---

## Tipos Frontend Importantes (`lib/types.ts`)

- `UserType` — `'CLIENTE' | 'PROFISSIONAL'`
- `ProposalStatus` — alinhado com schema acima
- `User` — inclui `perfilIncompleto`, `missingFields`, `perfilProfissional`, `perfilCliente`
- `ClientProfile` — `tipo_cliente`, `preferencias_busca`
- `OnboardingStep` — `'dados' | 'identidade' | 'documentos' | 'especifico'`
- `ToastState` / `Toast` / `FormErrors` — tipos de UI

Listas do onboarding em `lib/onboardingOptions.ts`: `PROFISSOES`, `EXPERIENCIAS`, `HABILIDADES`, `TIPOS_CLIENTE`, `PREFERENCIAS_BUSCA`.

---

## Comandos

```bash
# Backend
npm run dev          # tsx watch src/server.ts
npm run db:push      # aplicar migrations no Turso
npm run db:studio    # Drizzle Studio UI
npx tsx scratch/check_users.ts   # verificar perfis incompletos no console

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
5. **Controllers duplicados** na raiz de `controllers/` estão obsoletos; usar os de `controllers/client/` e `controllers/professional/`.

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

## Status Atual — atualizado em 12/06/2026

| Área | Status |
|------|--------|
| Backend (auth, CRUD, middleware) | Completo |
| Frontend (estrutura, rotas, contexto) | Completo |
| Integração Frontend ↔ Backend | Funcional |
| Login cliente / profissional | Funcionando |
| Onboarding de perfil incompleto | Implementado |
| Upload de foto de perfil | Implementado |
| Favoritos (usuários e serviços) | Implementado |
| Logout (todas as páginas) | Corrigido |
| Publicação e gestão de serviços | Implementado |
| Propostas e avaliações | Implementado |
| Banco de dados Turso (todas as tabelas) | Sincronizado |
| `tsc --noEmit` (frontend) | Passando (erros menores em Profile.tsx) |
| Testes de fluxo completo | Pendente |
| Verificação real de identidade/documentos | Pendente (telas simuladas) |
