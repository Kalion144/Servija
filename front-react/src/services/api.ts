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

export async function listarProfissionais() {
  const res = await fetch(`${API_URL}/professionals/`, {
    method: 'GET',
    credentials: 'include',
  });
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
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao atualizar perfil');
  return json;
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

export async function listarMeusServicos() {
  const res = await fetch(`${API_URL}/client/services`, {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
}

export async function listarTodosServicos() {
  const res = await fetch(`${API_URL}/client/services/all`, {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
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

export async function listarPropostasMarketplace() {
  const res = await fetch(`${API_URL}/professionals/proposals/marketplace`, {
    method: 'GET',
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao carregar marketplace');
  return json;
}

export async function demonstrarInteresse(proposalId: number | string) {
  const res = await fetch(`${API_URL}/professionals/proposals/${proposalId}/interest`, {
    method: 'POST',
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro ao registrar interesse');
  return json;
}
export async function obterDadosUsuario() {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
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
