import { RegisterData, LoginData } from '../lib/types';

const API_URL = 'http://localhost:3000';

// Client auth
export async function cadastrarCliente(data: Omit<RegisterData, 'tipo'>) {
  const res = await fetch(`${API_URL}/client/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function loginCliente(data: LoginData) {
  const res = await fetch(`${API_URL}/client/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.detalhes ?? json.erro ?? 'Erro ao fazer login');
  return json;
}

export async function logoutCliente() {
  const res = await fetch(`${API_URL}/client/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return res.json();
}

export async function atualizarCliente(data: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/client/auth/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return res.json();
}

// Professional auth
export async function cadastrarProfissional(data: Omit<RegisterData, 'tipo'>) {
  const res = await fetch(`${API_URL}/professional/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function loginProfissional(data: LoginData) {
  const res = await fetch(`${API_URL}/professional/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.detalhes ?? json.erro ?? 'Erro ao fazer login');
  return json;
}

export async function logoutProfissional() {
  const res = await fetch(`${API_URL}/professional/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return res.json();
}

export async function atualizarProfissional(data: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/professional/auth/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return res.json();
}

// Legacy functions (backward compatibility)
export async function cadastrarUser(data: RegisterData) {
  const endpoint =
    data.tipo === 'CLIENTE'
      ? '/client/auth/register'
      : '/professional/auth/register';
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function loginUser(data: LoginData) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.detalhes ?? json.erro ?? 'Erro ao fazer login');
  return json;
}

export async function logoutUser() {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  return res.json();
}

export async function atualizarUsuario(data: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/auth/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return res.json();
}

function buildQueryString(params?: Record<string, string | undefined>) {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value?.trim()) searchParams.append(key, value.trim());
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export async function listarProfissionais(params?: {
  cidade?: string;
  busca?: string;
}) {
  const res = await fetch(
    `${API_URL}/professionals/${buildQueryString(params)}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );
  return res.json();
}

export async function obterProfissionalPorId(id: number | string) {
  const res = await fetch(`${API_URL}/professionals/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
}

export async function criarPerfilProfissional(data: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/professionals/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function atualizarPerfilProfissional(
  data: Record<string, unknown>
) {
  const res = await fetch(`${API_URL}/professionals/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function atualizarPerfil(data: Record<string, unknown>) {
  return atualizarPerfilProfissional(data);
}

export async function adicionarServico(data: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/professionals/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function removerServico(id: number | string) {
  const res = await fetch(`${API_URL}/professionals/services/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return res.json();
}

// Serviços de cliente
export async function criarServico(data: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/client/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao criar serviço');
  return json;
}

export async function listarMeusServicos(params?: {
  cidade?: string;
  busca?: string;
}) {
  const res = await fetch(
    `${API_URL}/client/services${buildQueryString(params)}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );
  return res.json();
}

export async function listarTodosServicos(params?: {
  cidade?: string;
  busca?: string;
}) {
  const res = await fetch(
    `${API_URL}/client/services/all${buildQueryString(params)}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );
  return res.json();
}

export async function obterServicoPorId(id: number | string) {
  const res = await fetch(`${API_URL}/client/services/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao obter serviço');
  return json;
}

function conversationBase(isProfessional: boolean) {
  return isProfessional ? '/professionals' : '/client';
}

export async function iniciarConversa(serviceId: number) {
  const res = await fetch(`${API_URL}/professionals/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ service_id: serviceId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao iniciar conversa');
  return json;
}

export async function listarConversas(isProfessional: boolean) {
  const res = await fetch(
    `${API_URL}${conversationBase(isProfessional)}/conversations`,
    { method: 'GET', credentials: 'include' },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao listar conversas');
  return json;
}

export async function obterConversa(
  id: number | string,
  isProfessional: boolean,
) {
  const res = await fetch(
    `${API_URL}${conversationBase(isProfessional)}/conversations/${id}`,
    { method: 'GET', credentials: 'include' },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao obter conversa');
  return json;
}

export async function enviarMensagemChat(
  conversationId: number | string,
  data: {
    conteudo: string;
    tipo?: string;
    metadata?: Record<string, unknown>;
  },
  isProfessional: boolean,
) {
  const res = await fetch(
    `${API_URL}${conversationBase(isProfessional)}/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao enviar mensagem');
  return json;
}

export async function contratarProfissional(conversationId: number | string) {
  const res = await fetch(
    `${API_URL}/client/conversations/${conversationId}/contratar`,
    { method: 'PATCH', credentials: 'include' },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao contratar');
  return json;
}

export async function concluirConversa(
  conversationId: number | string,
  isProfessional: boolean,
) {
  const res = await fetch(
    `${API_URL}${conversationBase(isProfessional)}/conversations/${conversationId}/concluir`,
    { method: 'PATCH', credentials: 'include' },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao concluir');
  return json;
}

export async function conversaPorServico(
  serviceId: number | string,
  isProfessional: boolean,
) {
  const res = await fetch(
    `${API_URL}${conversationBase(isProfessional)}/conversations/service/${serviceId}`,
    { method: 'GET', credentials: 'include' },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao buscar conversa');
  return json;
}

export async function listarPropostasRecebidas() {
  const res = await fetch(`${API_URL}/client/proposals/received`, {
    method: 'GET',
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao listar propostas');
  return json;
}

export async function aceitarPropostaCliente(id: number | string) {
  const res = await fetch(`${API_URL}/client/proposals/${id}/accept`, {
    method: 'PATCH',
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao aceitar proposta');
  return json;
}

export async function recusarPropostaCliente(id: number | string) {
  const res = await fetch(`${API_URL}/client/proposals/${id}/reject`, {
    method: 'PATCH',
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao recusar proposta');
  return json;
}

// Propostas antigas
export async function criarProposta(data: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/client/proposals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao criar proposta');
  return json;
}

export async function deletarProposta(id: number | string) {
  const res = await fetch(`${API_URL}/client/proposals/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao excluir proposta');
  return json;
}

export async function atualizarProposta(
  id: number | string,
  data: Record<string, unknown>
) {
  const res = await fetch(`${API_URL}/client/proposals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao atualizar proposta');
  return json;
}

export async function listarMinhasPropostas() {
  const res = await fetch(`${API_URL}/client/proposals`, {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
}

export async function obterPropostaPorId(id: number | string) {
  const res = await fetch(`${API_URL}/client/proposals/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
}

export async function enviarPropostaParaProfissionais(
  id: number | string,
  professionals: unknown[]
) {
  const res = await fetch(`${API_URL}/client/proposals/${id}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ professionals }),
  });
  return res.json();
}

export async function iniciarServico(
  propostaId: number | string,
  professionalId: number | string
) {
  const res = await fetch(
    `${API_URL}/client/proposals/${propostaId}/start/${professionalId}`,
    {
      method: 'PATCH',
      credentials: 'include',
    }
  );
  return res.json();
}

export async function finalizarServico(propostaId: number | string) {
  const res = await fetch(`${API_URL}/client/proposals/${propostaId}/finish`, {
    method: 'PATCH',
    credentials: 'include',
  });
  return res.json();
}

// Propostas de profissional
export async function enviarProposta(data: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/professionals/proposals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao enviar proposta');
  return json;
}

export async function aceitarPropostaProfissional(id: number | string) {
  const res = await fetch(`${API_URL}/professionals/proposals/${id}/accept`, {
    method: 'POST',
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao aceitar proposta');
  return json;
}

export async function recusarPropostaProfissional(id: number | string) {
  const res = await fetch(`${API_URL}/professionals/proposals/${id}/reject`, {
    method: 'POST',
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao recusar proposta');
  return json;
}

export async function listarMinhasPropostasProfissional() {
  const res = await fetch(`${API_URL}/professionals/proposals`, {
    method: 'GET',
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao listar propostas');
  return json;
}

export async function marcarServicoComoConcluido(id: number | string) {
  const res = await fetch(`${API_URL}/professionals/proposals/${id}/complete`, {
    method: 'POST',
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.erro ?? 'Erro ao marcar serviço como concluído');
  return json;
}

export async function criarAvaliacao(data: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/client/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function criarAvaliacaoProfissional(data: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/professionals/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function listarAvaliacoesPorProfissional(id: number | string) {
  const res = await fetch(
    `${API_URL}/professionals/ratings/professionals/${id}`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );
  return res.json();
}

// ==========================================
// FUNÇÕES DE FAVORITOS
// ==========================================

export async function toggleFavoriteUser(userId: number, isProfessional: boolean = false) {
  const endpoint = isProfessional ? '/professionals/favorites/users' : '/client/favorites/users';
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ favorite_user_id: userId }),
  });
  return res.json();
}

export async function checkFavoriteUser(userId: number, isProfessional: boolean = false) {
  const endpoint = isProfessional ? `/professionals/favorites/users/check/${userId}` : `/client/favorites/users/check/${userId}`;
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
}

export async function listFavoriteUsers(
  isProfessional: boolean = false,
  params?: { search?: string; limit?: string },
) {
  const endpoint = isProfessional
    ? '/professionals/favorites/users'
    : '/client/favorites/users';
  const query: Record<string, string> = {};
  if (params?.search) query.search = params.search;
  if (params?.limit) query.limit = params.limit;
  const res = await fetch(
    `${API_URL}${endpoint}${buildQueryString(
      Object.keys(query).length > 0 ? query : undefined,
    )}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );
  return res.json();
}

export async function toggleFavoriteService(serviceId: number, isProfessional: boolean = false) {
  const endpoint = isProfessional ? '/professionals/favorites/services' : '/client/favorites/services';
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ favorite_service_id: serviceId }),
  });
  return res.json();
}

export async function checkFavoriteService(serviceId: number, isProfessional: boolean = false) {
  const endpoint = isProfessional ? `/professionals/favorites/services/check/${serviceId}` : `/client/favorites/services/check/${serviceId}`;
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
}

export async function listFavoriteServices(
  isProfessional: boolean = false,
  params?: { search?: string; limit?: string },
) {
  const endpoint = isProfessional
    ? '/professionals/favorites/services'
    : '/client/favorites/services';
  const query: Record<string, string> = {};
  if (params?.search) query.search = params.search;
  if (params?.limit) query.limit = params.limit;
  const res = await fetch(
    `${API_URL}${endpoint}${buildQueryString(
      Object.keys(query).length > 0 ? query : undefined,
    )}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );
  return res.json();
}

export type PlanId = 'FREE' | 'PRO' | 'PREMIUM';

function subscriptionBase(isProfessional: boolean) {
  return isProfessional ? '/professionals' : '/client';
}

export async function obterStatusAssinatura(isProfessional = false) {
  const res = await fetch(
    `${API_URL}${subscriptionBase(isProfessional)}/subscription/status`,
    { method: 'GET', credentials: 'include' },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao obter assinatura');
  return json;
}

export async function criarCheckoutAssinatura(
  plan: 'PRO' | 'PREMIUM',
  isProfessional = false,
) {
  const res = await fetch(
    `${API_URL}${subscriptionBase(isProfessional)}/subscription/checkout`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        plan,
        userType: isProfessional ? 'PROFISSIONAL' : 'CLIENTE',
      }),
    },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao iniciar checkout');
  return json;
}

export async function confirmarAssinatura(
  sessionId: string,
  isProfessional = false,
) {
  const res = await fetch(
    `${API_URL}${subscriptionBase(isProfessional)}/subscription/confirm?session_id=${encodeURIComponent(sessionId)}`,
    { method: 'GET', credentials: 'include' },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao confirmar assinatura');
  return json;
}

export async function obterDadosUsuario() {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
}

export async function atualizarOnboarding(data: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/auth/onboarding`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao atualizar perfil');
  return json;
}

export async function uploadFotoPerfil(file: File) {
  const formData = new FormData();
  formData.append('foto', file);

  const res = await fetch(`${API_URL}/auth/profile/photo`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao enviar foto');
  return json;
}

// Funções de upload de imagens
export async function uploadSingleImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_URL}/api/upload/single`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Erro ao fazer upload da imagem');
  return json;
}

export async function uploadMultipleImages(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const res = await fetch(`${API_URL}/api/upload/multiple`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok)
    throw new Error(json.error ?? 'Erro ao fazer upload das imagens');
  return json;
}

// Favoritos
export async function toggleFavorite(favoriteUserId: number | string, userType: 'CLIENTE' | 'PROFISSIONAL') {
  const endpoint = userType === 'CLIENTE' ? '/client/favorites' : '/professionals/favorites';
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ favorite_user_id: favoriteUserId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao atualizar favoritos');
  return json;
}

export async function checkFavorite(favoriteUserId: number | string, userType: 'CLIENTE' | 'PROFISSIONAL') {
  const endpoint = userType === 'CLIENTE' 
    ? `/client/favorites/check/${favoriteUserId}` 
    : `/professionals/favorites/check/${favoriteUserId}`;
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
}

export async function listFavorites(userType: 'CLIENTE' | 'PROFISSIONAL', params?: Record<string, unknown>) {
  const endpoint = userType === 'CLIENTE' ? '/client/favorites' : '/professionals/favorites';
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, String(value));
    });
  }
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
  
  const res = await fetch(`${API_URL}${endpoint}${queryString}`, {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
}
