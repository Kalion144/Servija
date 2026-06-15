export const CATEGORIAS_SERVICO = [
  'Elétrica',
  'Hidráulica',
  'Pintura',
  'Limpeza',
  'Construção',
  'Marcenaria',
  'Jardinagem',
  'Informática',
  'Design',
  'Fotografia',
  'Eventos',
  'Outros',
] as const;

export const SUBCATEGORIAS: Record<string, string[]> = {
  Elétrica: ['Instalação', 'Manutenção', 'Automação'],
  Hidráulica: ['Vazamentos', 'Instalação', 'Desentupimento'],
  Pintura: ['Interna', 'Externa', 'Textura'],
  Limpeza: ['Residencial', 'Comercial', 'Pós-obra'],
  Construção: ['Reforma', 'Alvenaria', 'Acabamento'],
  Outros: [],
};

export const URGENCIA_OPCOES = [
  { value: '24h', label: 'Urgente (24h)' },
  { value: '3dias', label: 'Até 3 dias' },
  { value: '7dias', label: 'Até 7 dias' },
  { value: 'sem_prazo', label: 'Sem prazo definido' },
] as const;

export const TIPO_ATENDIMENTO = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'online', label: 'Online' },
  { value: 'ambos', label: 'Ambos' },
] as const;

export const TAMANHO_PROJETO = [
  { value: 'pequeno', label: 'Pequeno' },
  { value: 'medio', label: 'Médio' },
  { value: 'grande', label: 'Grande' },
] as const;

export const TIPO_PROFISSIONAL = [
  { value: 'pf', label: 'Pessoa física' },
  { value: 'pj', label: 'Empresa' },
  { value: 'indiferente', label: 'Indiferente' },
] as const;

export const MELHOR_CONTATO = [
  'Telefone',
  'WhatsApp',
  'E-mail',
  'Chat da plataforma',
] as const;

export const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export type UrgenciaNivel = (typeof URGENCIA_OPCOES)[number]['value'];
export type TipoAtendimento = (typeof TIPO_ATENDIMENTO)[number]['value'];

export interface ServiceDetalhes {
  quantidade_estimada?: string;
  tamanho_projeto?: string;
  materiais_disponiveis?: boolean;
  equipamentos_necessarios?: string;
  nota_fiscal?: boolean;
  certificacao?: string;
  experiencia_minima?: string;
  tipo_profissional?: string;
  sexo_profissional?: string;
  idioma?: string;
  avaliacao_minima?: number;
  dias_disponiveis?: string;
  horarios_disponiveis?: string;
  melhor_contato?: string;
  observacoes?: string;
  restricao_acesso?: string;
  risco_seguranca?: string;
  como_conheceu?: string;
}
