// ==========================================
// ENUMS / TYPES
// ==========================================

export type UserType = 'CLIENTE' | 'PROFISSIONAL';

export type ProposalStatus =
  | 'PENDENTE'
  | 'ACEITA'
  | 'RECUSADA'
  | 'CANCELADA'
  | 'EM_ANDAMENTO'
  | 'FINALIZADA'
  | 'AVALIADA';

export type ProposalProfessionalStatus =
  | 'PENDENTE'
  | 'ACEITA'
  | 'RECUSADA'
  | 'CANCELADA'
  | 'EM_ANDAMENTO'
  | 'FINALIZADA'
  | 'AVALIADA';

export type ServicoStatus = 'aberto' | 'fechado' | 'andamento';

export type PropostaServicoStatus =
  | 'aguardando'
  | 'enviada'
  | 'aceita'
  | 'recusada';

export type FiltroProposta = 'all' | 'aguardando' | 'aceita' | 'recusada';

// ==========================================
// USER
// ==========================================

export interface ClientProfile {
  id: number;
  user_id: number;
  tipo_cliente: string;
  preferencias_busca?: string | null;
}

export interface User {
  id: number;
  nome: string;
  email: string;
  tipo: UserType;
  foto?: string | null;
  telefone?: string | null;
  cpf?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  dataNascimento?: string | null;
  bio?: string | null;
  notificacoes?: string | null;
  idioma?: string | null;
  media_estrelas?: number | null;
  media_trabalho?: number | null;
  media_tempo_execucao?: number | null;
  media_tempo_resposta?: number | null;
  total_avaliacoes?: number | null;
  created_at: number;
  perfilProfissional?: ProfessionalProfile | null;
  perfilCliente?: ClientProfile | null;
  perfilIncompleto?: boolean;
  missingFields?: string[];
}

export type OnboardingStep = 'dados' | 'identidade' | 'documentos' | 'especifico';

// ==========================================
// AUTH
// ==========================================

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  tipo: UserType;
  foto?: string | null;
}

export interface LoginData {
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ==========================================
// PROFESSIONAL
// ==========================================

export interface ProfessionalProfile {
  id: number;
  user_id: number;
  profissao?: string | null;
  descricao?: string | null;
  experiencia?: string | null;
  habilidades?: string | null;
  cidade?: string | null;
  telefone?: string | null;
  localizacao?: string | null;
  valor_hora?: number | null;
  media_estrelas?: number | null;
  media_trabalho?: number | null;
  media_tempo_execucao?: number | null;
  media_tempo_resposta?: number | null;
  total_avaliacoes?: number | null;
}

export interface ProfessionalService {
  id: number;
  professional_profile_id: number;

  categoria: string;
  subcategoria: string;
}

// ==========================================
// PROPOSALS
// ==========================================

export interface Proposal {
  id: number;

  client_id: number;

  titulo: string;
  descricao: string;

  valor: number;
  prazo: string;

  status: ProposalStatus;

  created_at: number;
}

export interface ProposalProfessional {
  id: number;

  proposal_id: number;
  professional_id: number;

  valor_proposto?: number | null;
  mensagem?: string | null;

  status: ProposalProfessionalStatus;
}

// ==========================================
// RATINGS
// ==========================================

export interface Rating {
  id: number;

  proposal_professional_id: number;

  client_id: number;
  professional_id: number;
  avaliador_tipo?: 'CLIENTE' | 'PROFISSIONAL';

  estrelas: number;
  estrelas_trabalho?: number;
  estrelas_tempo_execucao?: number;
  estrelas_tempo_resposta?: number;

  comentario?: string | null;
}

// ==========================================
// SERVIÇOS PUBLICADOS
// ==========================================

export interface ServicoPublicado {
  id: string;

  titulo: string;
  descricao: string;
  categoria: string;

  preco: number;

  urgente: boolean;

  contato: string;
  localizacao: string;

  fotos: string[];

  dataPublicacao: string;

  clienteId: string;
  clienteNome: string;

  status: ServicoStatus;
}

// ==========================================
// PROPOSTAS DE SERVIÇO
// ==========================================

export interface PropostaServico {
  id: number;

  servicoId: string;

  cliente: string;
  profissional: string;

  servico: string;
  mensagem: string;

  valor: number;

  data: string;

  status: PropostaServicoStatus;
}

// ==========================================
// UPLOADS
// ==========================================

export interface UploadedFile {
  base64: string;
  name: string;
}

// ==========================================
// UI / FRONTEND
// ==========================================

export interface ToastState {
  message: string;
  isError: boolean;
}

export interface Toast {
  msg: string;
  isError: boolean;
}

export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  userType?: string;
}

// ==========================================
// API RESPONSES
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];

  page: number;
  limit: number;

  total: number;
  totalPages: number;
}

// ==========================================
// RELAÇÕES COMPLETAS (VIEW MODELS)
// ==========================================

export interface ProfessionalWithUser extends ProfessionalProfile {
  user: User;
  services: ProfessionalService[];

  mediaEstrelas?: number;
  totalAvaliacoes?: number;
}

export interface ProposalWithProfessionals extends Proposal {
  professionals: ProposalProfessional[];
}

export interface RatingWithClient extends Rating {
  client: User;
}
