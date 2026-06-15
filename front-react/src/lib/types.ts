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

export type ConversationStatus =
  | 'ABERTA'
  | 'EM_NEGOCIACAO'
  | 'CONTRATADA'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDA'
  | 'CANCELADA';

export type MessageTipo = 'texto' | 'oferta' | 'imagem' | 'sistema';

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

export interface ServicoAnuncio {
  id: number;
  client_id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria?: string | null;
  objetivo?: string | null;
  preco?: number | null;
  valor_minimo?: number | null;
  valor_maximo?: number | null;
  orcamento_definido?: number;
  aceita_propostas?: number;
  urgente?: number;
  urgencia_nivel?: string | null;
  data_inicio_desejada?: string | null;
  data_limite?: string | null;
  tipo_atendimento?: string | null;
  contato?: string | null;
  nome_contratante?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  email_contato?: string | null;
  localizacao?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  referencia_local?: string | null;
  fotos?: string | string[] | null;
  anexos?: string | string[] | null;
  detalhes?: string | Record<string, unknown> | null;
  status: string;
  status_solicitacao?: string | null;
  created_at?: number;
  cliente_nome?: string;
}

export interface Conversation {
  id: number;
  service_id: number;
  client_id: number;
  professional_id: number;
  status: ConversationStatus;
  created_at: number;
  updated_at: number;
  servico_titulo?: string;
  servico_categoria?: string;
  servico_status?: string;
  outro_nome?: string;
  outro_foto?: string | null;
  servico?: ServicoAnuncio;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  tipo: MessageTipo;
  conteudo: string;
  metadata?: { valor?: number; negociavel?: boolean } | null;
  lida?: number;
  created_at: number;
  sender_nome?: string;
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
