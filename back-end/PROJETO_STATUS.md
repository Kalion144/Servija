# Status do Projeto — Servijá

## Data

12/06/2026

## Estrutura Geral

- **Backend**: raiz do projeto (Node.js + Express 5 + TypeScript + Drizzle ORM + Turso)
- **Frontend**: `front-react/` (React 18 + Vite + React Router DOM 6 + TypeScript)

---

## Backend

### Funcionalidades Implementadas

- [x] Autenticação (registro, login, logout com JWT em cookie httpOnly)
- [x] Verificação de perfil completo no login (`checkCompleteness`)
- [x] Endpoint de onboarding (`PUT /auth/onboarding`)
- [x] Upload de foto de perfil (`POST /auth/profile/photo`) em `uploads/profile/cliente/` e `uploads/profile/profissional/`
- [x] CRUD de profissionais e perfis (`professional_profiles`)
- [x] Perfis de cliente (`client_profiles`)
- [x] Publicação e listagem de serviços (`professional_services`)
- [x] Propostas entre clientes e profissionais (`proposal_professionals`)
- [x] Avaliações bidirecionais (`ratings`)
- [x] Favoritos de usuários e serviços (`favorites`, `favorite_services`)
- [x] Upload de imagens gerais (`/api/upload`)
- [x] Middleware de autenticação, CORS, logging e tratamento de erros
- [x] Script de diagnóstico: `scratch/check_users.ts`

### Rotas Principais

| Prefixo | Descrição |
|---------|-----------|
| `/auth/*` | Autenticação global + onboarding + foto de perfil |
| `/client/auth/*` | Auth específica do cliente |
| `/professional/auth/*` | Auth específica do profissional |
| `/client/*` | Serviços, propostas recebidas, avaliações, favoritos |
| `/professionals/*` | Perfis, propostas, serviços, avaliações, favoritos |
| `/api/upload/*` | Upload de imagens |

---

## Frontend

### Funcionalidades Implementadas

- [x] Estrutura de páginas separadas por fluxo (cliente / profissional)
- [x] Serviço de API centralizado (`services/api.ts`)
- [x] Contexto de autenticação com `refreshUser` e status de completude
- [x] Rotas protegidas (`ProtectedRoute`) — bloqueia acesso com perfil incompleto
- [x] Fluxo de onboarding multi-etapas (`OnboardingFlow.tsx`)
- [x] Listas pré-montadas para profissões, habilidades, tipos de cliente etc.
- [x] Componentes: BottomNav, Toast, Modal, Footer, OnboardingRoute
- [x] Páginas de favoritos (cliente e profissional)
- [x] Integração com APIs do backend

### Fluxo de Onboarding

```
Login → Dados pessoais → Verificação de identidade (simulada) → Documentos (simulada) → Perfil específico → Home
```

- Redirecionamento automático após login se `perfilIncompleto === true`
- Formulário exibe apenas os campos que faltam (`missingFields`)
- Usuário não acessa o site até concluir todas as etapas

### Páginas

**Gerais**
- `Index.tsx`, `Sobre.tsx`, `NotFound.tsx`

**Cliente** (`/client/`)
- `LoginClient.tsx`, `CadastroClient.tsx`
- `Home.tsx`, `Services.tsx`, `PostService.tsx`, `Proposals.tsx`, `Profile.tsx`, `Favorites.tsx`
- `onboarding/OnboardingFlow.tsx` (via `/client/onboarding`)

**Profissional** (`/professional/`)
- `LoginProfessional.tsx`, `CadastroProfessional.tsx`
- `Home.tsx`, `Proposals.tsx`, `ServiceDetails.tsx`, `SendProposal.tsx`, `Profile.tsx`, `Favorites.tsx`
- `onboarding/OnboardingFlow.tsx` (via `/professional/onboarding`)

---

## Banco de Dados

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários (cliente ou profissional) |
| `professional_profiles` | Dados profissionais (profissão, experiência, habilidades) |
| `client_profiles` | Dados do cliente (tipo, preferências de busca) |
| `professional_services` | Serviços publicados por clientes |
| `proposal_professionals` | Propostas enviadas por profissionais |
| `ratings` | Avaliações |
| `favorites` | Usuários favoritos |
| `favorite_services` | Serviços favoritos |

---

## Diagnóstico — Perfis Incompletos (12/06/2026)

Resultado de `npx tsx scratch/check_users.ts`:

| Usuário | ID | Campos faltando |
|---------|----|-----------------|
| profissional | 2 | dados profissionais |
| nobru | 4 | foto, telefone, cpf, cidade, estado, dados profissionais |
| rogerin do grau | 5 | foto, telefone, cpf, cidade, estado, dados profissionais |

---

## Tarefas Pendentes

- [ ] Implementar verificação real de identidade (SMS/OTP)
- [ ] Implementar upload e validação real de documentos
- [ ] Testes de fluxo completo (Vitest / E2E)
- [ ] Corrigir erros menores de TypeScript em `Profile.tsx` (cliente e profissional)
- [ ] Remover `CompleteProfileModal.tsx` (substituído pelo onboarding)
