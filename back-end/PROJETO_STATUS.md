# Status do Projeto

## Data

19/05/2026

## Estrutura Geral

- **Backend**: na raiz do projeto (Node.js + Express + TypeScript + Drizzle ORM)
- **Frontend**: no diretório `front-react/` (React + Vite + React Router DOM + TypeScript)

---

## Backend

### Funcionalidades Implementadas

- [x] Autenticação (registro e login com JWT)
- [x] CRUD de profissionais
- [x] CRUD de propostas
- [x] CRUD de avaliações
- [x] Middleware de autenticação
- [x] Esquema do banco de dados (SQLite)
- [x] Middleware de logging de requisições
- [x] Middleware de tratamento de erros centralizado
- [x] Logs detalhados nos controllers (authController.ts)
- [x] Middleware CORS para requisições cross-origin

### Rotas

- `/auth/*` - Autenticação
- `/professionals/*` - Profissionais
- `/proposals/*` - Propostas (clientes)
- `/proposal-professionals/*` - Propostas (profissionais)
- `/ratings/*` - Avaliações

---

## Frontend

### Funcionalidades Implementadas

- [x] Estrutura básica das páginas
- [x] Serviço de API (api.js)
- [x] Rotas básicas (App.jsx)
- [x] Componentes básicos (BottomNav, Toast, Modal, Footer)
- [x] Navegações corrigidas em quase todas as páginas

### Páginas

- Index.jsx (página inicial)
- Cadastro.jsx (cadastro de usuário)
- LoginUser.jsx (login de usuário)
- HomeCli.jsx (home cliente)
- HomeSev.jsx (home profissional)
- ServicosCli.jsx (serviços do cliente)
- PublicarServicoCli.jsx (publicar serviço)
- PropostasCli.jsx (propostas do cliente)
- TodasPropostasSev.jsx (propostas do profissional)
- DetalhesServicoSev.jsx (detalhes do serviço)
- EmviarPropostaSev.jsx (enviar proposta)
- PerfilSev.jsx (perfil do profissional)
- ConfPerfilCli.jsx (perfil do cliente)
- Sobre.jsx (sobre o projeto)

---

## Tarefas Pendentes

- [ ] Corrigir navegações em PerfilSev.jsx
- [ ] Integrar as páginas com as APIs do backend
- [ ] Testar todo o fluxo do projeto
