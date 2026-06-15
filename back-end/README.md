# API Documentation

## Base URL
`http://localhost:3000`

## Autenticação
Algumas rotas requerem autenticação via token JWT. O token deve ser enviado no header `Authorization` no formato `Bearer <token>`.

---

## Rotas de Autenticação (`/auth`)

### POST `/auth/register`
Cadastra um novo usuário (cliente ou profissional).

**Entrada (Body):**
```json
{
  "nome": "string",
  "email": "string",
  "senha": "string",
  "tipo": "CLIENTE" | "PROFISSIONAL",
  "foto": "string (opcional)"
}
```

**Saída (Sucesso - 201):**
```json
{
  "mensagem": "Usuário cadastrado com sucesso",
  "token": "string",
  "usuario": {
    "id": "number",
    "nome": "string",
    "email": "string",
    "tipo": "CLIENTE" | "PROFISSIONAL",
    "foto": "string (opcional)"
  }
}
```

**Saída (Erro - 400):**
```json
{
  "erro": "Email já cadastrado"
}
```

---

### POST `/auth/login`
Realiza login de um usuário.

**Entrada (Body):**
```json
{
  "email": "string",
  "senha": "string"
}
```

**Saída (Sucesso - 200):**
```json
{
  "mensagem": "Login realizado com sucesso",
  "token": "string",
  "usuario": {
    "id": "number",
    "nome": "string",
    "email": "string",
    "tipo": "CLIENTE" | "PROFISSIONAL",
    "foto": "string (opcional)",
    "perfilProfissional": "object (opcional, se for profissional)"
  }
}
```

**Saída (Erro - 401):**
```json
{
  "erro": "Credenciais inválidas"
}
```

---

## Rotas de Profissionais (`/professionals`)

### GET `/professionals`
Lista profissionais, com filtros opcionais por cidade e categoria.

**Entrada (Query Params):**
- `cidade`: string (opcional)
- `categoria`: string (opcional)

**Saída (Sucesso - 200):**
```json
[
  {
    "id": "number",
    "nome": "string",
    "email": "string",
    "foto": "string",
    "tipo": "PROFISSIONAL",
    "profile": {
      "id": "number",
      "user_id": "number",
      "descricao": "string",
      "experiencia": "number",
      "cidade": "string",
      "valor_hora": "number",
      "media_estrelas": "number",
      "total_avaliacoes": "number",
      "telefone": "string"
    }
  }
]
```

---

### GET `/professionals/:id`
Obtém detalhes de um profissional por ID, incluindo serviços e avaliações.

**Entrada (Path Params):**
- `id`: number

**Saída (Sucesso - 200):**
```json
{
  "id": "number",
  "nome": "string",
  "email": "string",
  "foto": "string",
  "tipo": "PROFISSIONAL",
  "profile": {
    "id": "number",
    "user_id": "number",
    "descricao": "string",
    "experiencia": "number",
    "cidade": "string",
    "valor_hora": "number",
    "media_estrelas": "number",
    "total_avaliacoes": "number",
    "telefone": "string"
  },
  "servicos": [
    {
      "id": "number",
      "professional_profile_id": "number",
      "categoria": "string",
      "subcategoria": "string"
    }
  ],
  "avaliacoes": [
    {
      "id": "number",
      "estrelas": "number",
      "comentario": "string",
      "created_at": "number (timestamp)",
      "cliente": {
        "id": "number",
        "nome": "string",
        "email": "string",
        "senha_hash": "string",
        "tipo": "CLIENTE",
        "foto": "string",
        "created_at": "number (timestamp)"
      }
    }
  ]
}
```

**Saída (Erro - 404):**
```json
{
  "erro": "Profissional não encontrado"
}
```

---

### POST `/professionals/profile`
Cria perfil profissional (requer autenticação como profissional).

**Autenticação:** Requer token JWT (tipo PROFISSIONAL)

**Entrada (Body):**
```json
{
  "descricao": "string",
  "experiencia": "number",
  "cidade": "string",
  "valor_hora": "number",
  "telefone": "string"
}
```

**Saída (Sucesso - 201):**
```json
{
  "mensagem": "Perfil profissional criado com sucesso",
  "perfil": {
    "id": "number",
    "user_id": "number",
    "descricao": "string",
    "experiencia": "number",
    "cidade": "string",
    "valor_hora": "number",
    "telefone": "string"
  }
}
```

**Saída (Erro - 403):**
```json
{
  "erro": "Apenas profissionais podem criar perfil"
}
```

**Saída (Erro - 400):**
```json
{
  "erro": "Perfil profissional já existe"
}
```

---

### PUT `/professionals/profile`
Atualiza perfil profissional (requer autenticação como profissional).

**Autenticação:** Requer token JWT (tipo PROFISSIONAL)

**Entrada (Body):**
```json
{
  "descricao": "string",
  "experiencia": "number",
  "cidade": "string",
  "valor_hora": "number",
  "telefone": "string"
}
```

**Saída (Sucesso - 200):**
```json
{
  "mensagem": "Perfil atualizado com sucesso"
}
```

**Saída (Erro - 403):**
```json
{
  "erro": "Apenas profissionais podem atualizar perfil"
}
```

---

### POST `/professionals/services`
Adiciona um serviço ao perfil profissional (requer autenticação como profissional).

**Autenticação:** Requer token JWT (tipo PROFISSIONAL)

**Entrada (Body):**
```json
{
  "categoria": "string",
  "subcategoria": "string"
}
```

**Saída (Sucesso - 201):**
```json
{
  "mensagem": "Serviço adicionado com sucesso",
  "servico": {
    "id": "number",
    "professional_profile_id": "number",
    "categoria": "string",
    "subcategoria": "string"
  }
}
```

**Saída (Erro - 403):**
```json
{
  "erro": "Apenas profissionais podem adicionar serviços"
}
```

**Saída (Erro - 404):**
```json
{
  "erro": "Perfil profissional não encontrado"
}
```

---

### DELETE `/professionals/services/:id`
Remove um serviço do perfil profissional (requer autenticação como profissional).

**Autenticação:** Requer token JWT (tipo PROFISSIONAL)

**Entrada (Path Params):**
- `id`: number

**Saída (Sucesso - 200):**
```json
{
  "mensagem": "Serviço removido com sucesso"
}
```

**Saída (Erro - 403):**
```json
{
  "erro": "Apenas profissionais podem remover serviços"
}
```

**Saída (Erro - 404):**
```json
{
  "erro": "Perfil profissional não encontrado"
}
```

---

## Rotas de Propostas (`/proposals`)

### POST `/proposals`
Cria uma nova proposta (requer autenticação como cliente).

**Autenticação:** Requer token JWT (tipo CLIENTE)

**Entrada (Body):**
```json
{
  "titulo": "string",
  "descricao": "string",
  "valor": "number",
  "prazo": "string"
}
```

**Saída (Sucesso - 201):**
```json
{
  "mensagem": "Proposta criada com sucesso",
  "proposta": {
    "id": "number",
    "client_id": "number",
    "titulo": "string",
    "descricao": "string",
    "valor": "number",
    "prazo": "string",
    "status": "PENDENTE"
  }
}
```

**Saída (Erro - 403):**
```json
{
  "erro": "Apenas clientes podem criar propostas"
}
```

---

### GET `/proposals`
Lista propostas do usuário autenticado (cliente ou profissional).

**Autenticação:** Requer token JWT

**Saída (Sucesso - 200):**
```json
[
  {
    "id": "number",
    "client_id": "number",
    "titulo": "string",
    "descricao": "string",
    "valor": "number",
    "prazo": "string",
    "status": "PENDENTE" | "ACEITA" | "RECUSADA" | "CANCELADA" | "EM_ANDAMENTO" | "FINALIZADA" | "AVALIADA",
    "created_at": "number (timestamp)",
    "proposalProfessional": "object (apenas para profissionais)"
  }
]
```

---

### GET `/proposals/:id`
Obtém detalhes de uma proposta por ID.

**Autenticação:** Requer token JWT

**Entrada (Path Params):**
- `id`: number

**Saída (Sucesso - 200):**
```json
{
  "id": "number",
  "client_id": "number",
  "titulo": "string",
  "descricao": "string",
  "valor": "number",
  "prazo": "string",
  "status": "PENDENTE" | "ACEITA" | "RECUSADA" | "CANCELADA" | "EM_ANDAMENTO" | "FINALIZADA" | "AVALIADA",
  "created_at": "number (timestamp)",
  "cliente": {
    "id": "number",
    "nome": "string",
    "email": "string",
    "senha_hash": "string",
    "tipo": "CLIENTE",
    "foto": "string",
    "created_at": "number (timestamp)"
  },
  "profissionais": [
    {
      "id": "number",
      "nome": "string",
      "email": "string",
      "foto": "string",
      "profile": "object",
      "status": "PENDENTE" | "ACEITA" | "RECUSADA" | "CANCELADA" | "EM_ANDAMENTO" | "FINALIZADA" | "AVALIADA",
      "proposalProfessionalId": "number"
    }
  ]
}
```

**Saída (Erro - 404):**
```json
{
  "erro": "Proposta não encontrada"
}
```

**Saída (Erro - 403):**
```json
{
  "erro": "Acesso negado a esta proposta"
}
```

---

### POST `/proposals/:id/send`
Envia uma proposta para profissionais (requer autenticação como cliente).

**Autenticação:** Requer token JWT (tipo CLIENTE)

**Entrada (Path Params):**
- `id`: number

**Entrada (Body):**
```json
{
  "professionals": ["number"]
}
```

**Saída (Sucesso - 200):**
```json
{
  "mensagem": "Proposta enviada para os profissionais com sucesso"
}
```

**Saída (Erro - 403):**
```json
{
  "erro": "Apenas clientes podem enviar propostas"
}
```

**Saída (Erro - 404):**
```json
{
  "erro": "Proposta não encontrada"
}
```

---

### PATCH `/proposals/:id/start/:professionalId`
Inicia um serviço (requer autenticação como cliente).

**Autenticação:** Requer token JWT (tipo CLIENTE)

**Entrada (Path Params):**
- `id`: number (ID da proposta)
- `professionalId`: number (ID do profissional)

**Saída (Sucesso - 200):**
```json
{
  "mensagem": "Serviço iniciado com sucesso"
}
```

**Saída (Erro - 403):**
```json
{
  "erro": "Apenas clientes podem iniciar serviços"
}
```

**Saída (Erro - 404):**
```json
{
  "erro": "Proposta não encontrada"
}
```

---

### PATCH `/proposals/:id/finish`
Finaliza um serviço.

**Autenticação:** Requer token JWT

**Entrada (Path Params):**
- `id`: number

**Saída (Sucesso - 200):**
```json
{
  "mensagem": "Serviço finalizado com sucesso"
}
```

**Saída (Erro - 404):**
```json
{
  "erro": "Proposta não encontrada"
}
```

**Saída (Erro - 403):**
```json
{
  "erro": "Acesso negado a esta proposta"
}
```

---

## Rotas de Propostas para Profissionais (`/proposal-professionals`)

### POST `/proposal-professionals/:id/accept`
Aceita uma proposta (requer autenticação como profissional).

**Autenticação:** Requer token JWT (tipo PROFISSIONAL)

**Entrada (Path Params):**
- `id`: number (ID do proposalProfessional)

**Saída (Sucesso - 200):**
```json
{
  "mensagem": "Proposta aceita com sucesso"
}
```

**Saída (Erro - 403):**
```json
{
  "erro": "Apenas profissionais podem aceitar propostas"
}
```

**Saída (Erro - 404):**
```json
{
  "erro": "Registro não encontrado"
}
```

---

### POST `/proposal-professionals/:id/reject`
Recusa uma proposta (requer autenticação como profissional).

**Autenticação:** Requer token JWT (tipo PROFISSIONAL)

**Entrada (Path Params):**
- `id`: number (ID do proposalProfessional)

**Saída (Sucesso - 200):**
```json
{
  "mensagem": "Proposta recusada com sucesso"
}
```

**Saída (Erro - 403):**
```json
{
  "erro": "Apenas profissionais podem recusar propostas"
}
```

**Saída (Erro - 404):**
```json
{
  "erro": "Registro não encontrado"
}
```

---

## Rotas de Avaliações (`/ratings`)

### POST `/ratings`
Cria uma avaliação para um serviço (requer autenticação como cliente).

**Autenticação:** Requer token JWT (tipo CLIENTE)

**Entrada (Body):**
```json
{
  "proposal_professional_id": "number",
  "estrelas": "number",
  "comentario": "string"
}
```

**Saída (Sucesso - 201):**
```json
{
  "mensagem": "Avaliação criada com sucesso",
  "avaliacao": {
    "id": "number",
    "proposal_professional_id": "number",
    "client_id": "number",
    "professional_id": "number",
    "estrelas": "number",
    "comentario": "string"
  }
}
```

**Saída (Erro - 403):**
```json
{
  "erro": "Apenas clientes podem criar avaliações"
}
```

**Saída (Erro - 404):**
```json
{
  "erro": "Registro de proposta não encontrado"
}
```

**Saída (Erro - 400):**
```json
{
  "erro": "Só pode avaliar serviços finalizados"
}
```
ou
```json
{
  "erro": "Avaliação já existe para este serviço"
}
```

---

### GET `/ratings/professionals/:id`
Lista avaliações de um profissional por ID.

**Entrada (Path Params):**
- `id`: number

**Saída (Sucesso - 200):**
```json
[
  {
    "id": "number",
    "proposal_professional_id": "number",
    "client_id": "number",
    "professional_id": "number",
    "estrelas": "number",
    "comentario": "string",
    "created_at": "number (timestamp)"
  }
]
```
