import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Toast } from '../../components/Toast';
import {
  criarServico,
  uploadMultipleImages,
  obterStatusAssinatura,
} from '../../services/api';
import {
  CATEGORIAS_SERVICO,
  SUBCATEGORIAS,
  URGENCIA_OPCOES,
  TIPO_ATENDIMENTO,
  TAMANHO_PROJETO,
  TIPO_PROFISSIONAL,
  MELHOR_CONTATO,
  ESTADOS_BR,
  type ServiceDetalhes,
} from '../../lib/serviceOptions';

interface FormData {
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria: string;
  objetivo: string;
  urgencia_nivel: string;
  data_inicio_desejada: string;
  data_limite: string;
  tipo_atendimento: string;
  orcamento_definido: boolean;
  valor_minimo: string;
  valor_maximo: string;
  aceita_propostas: boolean;
  nome_contratante: string;
  telefone: string;
  whatsapp: string;
  email_contato: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  referencia_local: string;
  detalhes: ServiceDetalhes;
}

const PostService: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descricao: '',
    categoria: '',
    subcategoria: '',
    objetivo: '',
    urgencia_nivel: '7dias',
    data_inicio_desejada: '',
    data_limite: '',
    tipo_atendimento: 'presencial',
    orcamento_definido: false,
    valor_minimo: '',
    valor_maximo: '',
    aceita_propostas: true,
    nome_contratante: usuario?.nome || '',
    telefone: usuario?.telefone || '',
    whatsapp: usuario?.telefone || '',
    email_contato: usuario?.email || '',
    endereco: usuario?.endereco || '',
    cidade: usuario?.cidade || '',
    estado: usuario?.estado || '',
    cep: '',
    referencia_local: '',
    detalhes: {
      tamanho_projeto: 'medio',
      melhor_contato: 'WhatsApp',
      tipo_profissional: 'indiferente',
    },
  });

  const [fotos, setFotos] = useState<File[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [canCreateMore, setCanCreateMore] = useState(true);
  const [planInfo, setPlanInfo] = useState({ plan: 'FREE', max: 3, current: 0 });
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);

  useEffect(() => {
    obterStatusAssinatura(false)
      .then((status) => {
        setCanCreateMore(status.canCreateMore);
        setPlanInfo({
          plan: status.plan ?? 'FREE',
          max: status.maxOpenServices ?? 3,
          current: status.currentOpenServices ?? 0,
        });
      })
      .catch(console.error);
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subcategorias =
    SUBCATEGORIAS[formData.categoria] || SUBCATEGORIAS.Outros;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDetalheChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      detalhes: {
        ...prev.detalhes,
        [name]: type === 'checkbox' ? checked : value,
      },
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFotos((prev) => [...prev, ...files]);
  };

  const removerFoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const mostrarToast = (msg: string, isError = false) => {
    setToast({ message: msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const validarFormulario = (): boolean => {
    if (!formData.titulo.trim()) {
      mostrarToast('Informe o título', true);
      return false;
    }
    if (!formData.descricao.trim()) {
      mostrarToast('Informe a descrição', true);
      return false;
    }
    if (!formData.categoria) {
      mostrarToast('Selecione uma categoria', true);
      return false;
    }
    if (!formData.cidade.trim() && !formData.endereco.trim()) {
      mostrarToast('Informe cidade ou endereço', true);
      return false;
    }
    if (!formData.tipo_atendimento) {
      mostrarToast('Selecione o tipo de atendimento', true);
      return false;
    }
    if (!formData.nome_contratante.trim()) {
      mostrarToast('Informe seu nome', true);
      return false;
    }
    if (!formData.telefone.trim() && !formData.whatsapp.trim()) {
      mostrarToast('Informe telefone ou WhatsApp', true);
      return false;
    }
    if (
      formData.orcamento_definido &&
      !formData.valor_minimo &&
      !formData.valor_maximo
    ) {
      mostrarToast('Informe a faixa de orçamento', true);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canCreateMore) {
      mostrarToast(
        `Limite de ${planInfo.max} serviços abertos (plano ${planInfo.plan}). Faça upgrade em Home.`,
        true,
      );
      return;
    }
    if (!validarFormulario() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let fotoUrls: string[] = [];
      if (fotos.length > 0) {
        const uploadResult = await uploadMultipleImages(fotos);
        fotoUrls = uploadResult.urls;
      }

      const localizacao =
        formData.cidade && formData.estado
          ? `${formData.cidade} - ${formData.estado}`
          : formData.cidade || formData.endereco;

      const dadosServico = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria: formData.categoria,
        subcategoria: formData.subcategoria || null,
        objetivo: formData.objetivo || null,
        urgencia_nivel: formData.urgencia_nivel,
        urgente: formData.urgencia_nivel === '24h',
        data_inicio_desejada: formData.data_inicio_desejada || null,
        data_limite: formData.data_limite || null,
        tipo_atendimento: formData.tipo_atendimento,
        orcamento_definido: formData.orcamento_definido,
        valor_minimo: formData.valor_minimo
          ? Number(formData.valor_minimo)
          : null,
        valor_maximo: formData.valor_maximo
          ? Number(formData.valor_maximo)
          : null,
        aceita_propostas: formData.aceita_propostas,
        nome_contratante: formData.nome_contratante,
        telefone: formData.telefone,
        whatsapp: formData.whatsapp,
        email_contato: formData.email_contato,
        contato: formData.whatsapp || formData.telefone,
        localizacao,
        endereco: formData.endereco,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep,
        referencia_local: formData.referencia_local,
        fotos: fotoUrls,
        detalhes: formData.detalhes,
      };

      await criarServico(dadosServico);
      mostrarToast('Serviço publicado com sucesso!');
      setTimeout(() => navigate('/client/services'), 1300);
    } catch (error) {
      console.error(error);
      mostrarToast(
        error instanceof Error ? error.message : 'Erro ao publicar serviço',
        true,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #f0f4fa; color: #1e293b; padding: 1.5rem; min-height: 100vh; }
    .publish-container { max-width: 920px; margin: 0 auto; background: white; border-radius: 32px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e6eef8; }
    .form-header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 2rem 2.25rem; display: flex; justify-content: space-between; align-items: center; }
    .header-content h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.3rem; }
    .subhead { opacity: 0.95; font-size: 0.95rem; }
    .back-btn { background: rgba(255,255,255,0.18); border: none; color: white; padding: 0.65rem 1.2rem; border-radius: 24px; font-weight: 600; cursor: pointer; }
    .form-content { padding: 2.25rem; }
    .section-title { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin: 1.5rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e6eef8; display: flex; align-items: center; gap: 8px; }
    .section-title:first-child { margin-top: 0; }
    .field-group { margin-bottom: 1.4rem; }
    .field-label { font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem; color: #0f172a; font-size: 0.9rem; }
    .required-star { color: #dc2626; }
    input, textarea, select { width: 100%; padding: 0.85rem 1rem; border: 1px solid #dbe5f5; border-radius: 14px; font-size: 0.95rem; background: white; font-family: inherit; }
    input:focus, textarea:focus, select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
    textarea { min-height: 110px; resize: vertical; }
    .hint-text { margin-top: 0.4rem; font-size: 0.82rem; color: #64748b; }
    .upload-area { border: 2px dashed #cbd5e1; border-radius: 16px; padding: 2rem; text-align: center; cursor: pointer; background: #f8fafc; }
    .upload-area:hover { border-color: #3b82f6; background: #eff6ff; }
    .file-list { margin-top: 0.8rem; display: flex; flex-wrap: wrap; gap: 0.6rem; }
    .file-tag { background: #eff6ff; color: #1d4ed8; padding: 0.5rem 0.75rem; border-radius: 20px; font-size: 0.82rem; display: flex; align-items: center; gap: 0.4rem; }
    .file-tag img { width: 40px; height: 40px; object-fit: cover; border-radius: 8px; }
    .radio-group { display: flex; flex-wrap: wrap; gap: 0.6rem; }
    .radio-item { background: #f8fafc; border: 1px solid #dbe5f5; border-radius: 14px; padding: 0.6rem 1rem; cursor: pointer; font-weight: 500; font-size: 0.9rem; }
    .radio-item.selected { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }
    .double-row, .triple-row { display: grid; gap: 1rem; }
    .double-row { grid-template-columns: 1fr 1fr; }
    .triple-row { grid-template-columns: 1fr 1fr 1fr; }
    .checkbox-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
    .advanced-toggle { width: 100%; background: #f8fafc; border: 1px dashed #cbd5e1; padding: 0.9rem; border-radius: 14px; font-weight: 600; color: #475569; cursor: pointer; margin: 1rem 0; }
    .advanced-section { padding-top: 0.5rem; }
    .publish-btn { width: 100%; border: none; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 1rem; border-radius: 20px; font-size: 1rem; font-weight: 700; cursor: pointer; margin-top: 1rem; }
    .publish-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    @media (max-width: 768px) { .double-row, .triple-row { grid-template-columns: 1fr; } .form-header { flex-direction: column; align-items: flex-start; gap: 0.8rem; } }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="publish-container">
        <div className="form-header">
          <div className="header-content">
            <h1>Publicar serviço</h1>
            <div className="subhead">
              Descreva sua necessidade e converse com profissionais
            </div>
          </div>
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate('/client/services')}
          >
            Voltar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-content">
          <div className="section-title">Dados do serviço</div>

          <div className="field-group">
            <div className="field-label">
              Título <span className="required-star">*</span>
            </div>
            <input
              name="titulo"
              placeholder="Ex: Instalação elétrica residencial"
              value={formData.titulo}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <div className="field-label">
              Categoria <span className="required-star">*</span>
            </div>
            <div className="radio-group">
              {CATEGORIAS_SERVICO.map((cat) => (
                <label
                  key={cat}
                  className={`radio-item ${formData.categoria === cat ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="categoria"
                    value={cat}
                    checked={formData.categoria === cat}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {subcategorias.length > 0 && (
            <div className="field-group">
              <div className="field-label">Subcategoria (opcional)</div>
              <select
                name="subcategoria"
                value={formData.subcategoria}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                {subcategorias.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field-group">
            <div className="field-label">
              Descrição detalhada <span className="required-star">*</span>
            </div>
            <textarea
              name="descricao"
              placeholder="Descreva o que precisa ser feito..."
              value={formData.descricao}
              onChange={handleChange}
            />
          </div>

          <div className="section-title">Localização e atendimento</div>

          <div className="field-group">
            <div className="field-label">
              Tipo de atendimento <span className="required-star">*</span>
            </div>
            <div className="radio-group">
              {TIPO_ATENDIMENTO.map((t) => (
                <label
                  key={t.value}
                  className={`radio-item ${formData.tipo_atendimento === t.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="tipo_atendimento"
                    value={t.value}
                    checked={formData.tipo_atendimento === t.value}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <div className="triple-row">
            <div className="field-group">
              <div className="field-label">
                Cidade <span className="required-star">*</span>
              </div>
              <input
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                placeholder="Sua cidade"
              />
            </div>
            <div className="field-group">
              <div className="field-label">Estado</div>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              >
                <option value="">UF</option>
                {ESTADOS_BR.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <div className="field-label">CEP</div>
              <input
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                placeholder="00000-000"
              />
            </div>
          </div>

          <div className="field-group">
            <div className="field-label">Endereço do serviço</div>
            <input
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              placeholder="Rua, número, bairro"
            />
          </div>

          <div className="section-title">Prazo e orçamento</div>

          <div className="field-group">
            <div className="field-label">Nível de urgência</div>
            <div className="radio-group">
              {URGENCIA_OPCOES.map((u) => (
                <label
                  key={u.value}
                  className={`radio-item ${formData.urgencia_nivel === u.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="urgencia_nivel"
                    value={u.value}
                    checked={formData.urgencia_nivel === u.value}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  {u.label}
                </label>
              ))}
            </div>
          </div>

          <div className="double-row">
            <div className="field-group">
              <div className="field-label">Data desejada para início</div>
              <input
                type="date"
                name="data_inicio_desejada"
                value={formData.data_inicio_desejada}
                onChange={handleChange}
              />
            </div>
            <div className="field-group">
              <div className="field-label">Data limite para conclusão</div>
              <input
                type="date"
                name="data_limite"
                value={formData.data_limite}
                onChange={handleChange}
              />
            </div>
          </div>

          <label className="checkbox-item field-group">
            <input
              type="checkbox"
              name="orcamento_definido"
              checked={formData.orcamento_definido}
              onChange={handleChange}
            />
            Possuo orçamento definido
          </label>

          {formData.orcamento_definido && (
            <div className="double-row">
              <div className="field-group">
                <div className="field-label">Valor mínimo (R$)</div>
                <input
                  type="number"
                  name="valor_minimo"
                  value={formData.valor_minimo}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="field-group">
                <div className="field-label">Valor máximo (R$)</div>
                <input
                  type="number"
                  name="valor_maximo"
                  value={formData.valor_maximo}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          )}

          <div className="section-title">Fotos e anexos</div>

          <div className="field-group">
            <div
              className="upload-area"
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{ fontWeight: 600 }}>Clique para adicionar fotos</div>
              <div className="hint-text">JPG, PNG até 5MB cada</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
            {fotos.length > 0 && (
              <div className="file-list">
                {fotos.map((foto, idx) => (
                  <div key={idx} className="file-tag">
                    <img src={URL.createObjectURL(foto)} alt="" />
                    {foto.name.substring(0, 15)}
                    <i
                      className="fas fa-times"
                      style={{ cursor: 'pointer' }}
                      onClick={() => removerFoto(idx)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="section-title">Contato</div>

          <div className="double-row">
            <div className="field-group">
              <div className="field-label">
                Nome <span className="required-star">*</span>
              </div>
              <input
                name="nome_contratante"
                value={formData.nome_contratante}
                onChange={handleChange}
              />
            </div>
            <div className="field-group">
              <div className="field-label">E-mail</div>
              <input
                name="email_contato"
                type="email"
                value={formData.email_contato}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="double-row">
            <div className="field-group">
              <div className="field-label">
                Telefone <span className="required-star">*</span>
              </div>
              <input
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="field-group">
              <div className="field-label">WhatsApp</div>
              <input
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <button
            type="button"
            className="advanced-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '▼ Ocultar detalhes avançados' : '▶ Mostrar detalhes avançados (opcional)'}
          </button>

          {showAdvanced && (
            <div className="advanced-section">
              <div className="field-group">
                <div className="field-label">Objetivo do serviço</div>
                <input
                  name="objetivo"
                  value={formData.objetivo}
                  onChange={handleChange}
                  placeholder="O que você espera alcançar?"
                />
              </div>

              <div className="field-group">
                <div className="field-label">Referência do local</div>
                <input
                  name="referencia_local"
                  value={formData.referencia_local}
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <div className="field-label">Tamanho do projeto</div>
                <div className="radio-group">
                  {TAMANHO_PROJETO.map((t) => (
                    <label
                      key={t.value}
                      className={`radio-item ${formData.detalhes.tamanho_projeto === t.value ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="tamanho_projeto"
                        value={t.value}
                        checked={formData.detalhes.tamanho_projeto === t.value}
                        onChange={handleDetalheChange}
                        style={{ display: 'none' }}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <div className="field-label">Quantidade estimada do trabalho</div>
                <input
                  name="quantidade_estimada"
                  value={formData.detalhes.quantidade_estimada || ''}
                  onChange={handleDetalheChange}
                  placeholder="Ex: 3 cômodos, 50m²"
                />
              </div>

              <label className="checkbox-item field-group">
                <input
                  type="checkbox"
                  name="materiais_disponiveis"
                  checked={!!formData.detalhes.materiais_disponiveis}
                  onChange={handleDetalheChange}
                />
                Materiais já disponíveis
              </label>

              <div className="field-group">
                <div className="field-label">Equipamentos necessários</div>
                <input
                  name="equipamentos_necessarios"
                  value={formData.detalhes.equipamentos_necessarios || ''}
                  onChange={handleDetalheChange}
                />
              </div>

              <label className="checkbox-item field-group">
                <input
                  type="checkbox"
                  name="nota_fiscal"
                  checked={!!formData.detalhes.nota_fiscal}
                  onChange={handleDetalheChange}
                />
                Necessita emissão de nota fiscal
              </label>

              <div className="field-group">
                <div className="field-label">Certificação exigida</div>
                <input
                  name="certificacao"
                  value={formData.detalhes.certificacao || ''}
                  onChange={handleDetalheChange}
                />
              </div>

              <div className="field-group">
                <div className="field-label">Tipo de profissional</div>
                <div className="radio-group">
                  {TIPO_PROFISSIONAL.map((t) => (
                    <label
                      key={t.value}
                      className={`radio-item ${formData.detalhes.tipo_profissional === t.value ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="tipo_profissional"
                        value={t.value}
                        checked={formData.detalhes.tipo_profissional === t.value}
                        onChange={handleDetalheChange}
                        style={{ display: 'none' }}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="double-row">
                <div className="field-group">
                  <div className="field-label">Experiência mínima</div>
                  <input
                    name="experiencia_minima"
                    value={formData.detalhes.experiencia_minima || ''}
                    onChange={handleDetalheChange}
                    placeholder="Ex: 2 anos"
                  />
                </div>
                <div className="field-group">
                  <div className="field-label">Avaliação mínima (estrelas)</div>
                  <input
                    type="number"
                    name="avaliacao_minima"
                    min="1"
                    max="5"
                    value={formData.detalhes.avaliacao_minima || ''}
                    onChange={handleDetalheChange}
                  />
                </div>
              </div>

              <div className="double-row">
                <div className="field-group">
                  <div className="field-label">Dias disponíveis</div>
                  <input
                    name="dias_disponiveis"
                    value={formData.detalhes.dias_disponiveis || ''}
                    onChange={handleDetalheChange}
                    placeholder="Seg a Sex"
                  />
                </div>
                <div className="field-group">
                  <div className="field-label">Horários disponíveis</div>
                  <input
                    name="horarios_disponiveis"
                    value={formData.detalhes.horarios_disponiveis || ''}
                    onChange={handleDetalheChange}
                    placeholder="Manhã / Tarde"
                  />
                </div>
              </div>

              <div className="field-group">
                <div className="field-label">Melhor forma de contato</div>
                <select
                  name="melhor_contato"
                  value={formData.detalhes.melhor_contato || ''}
                  onChange={handleDetalheChange}
                >
                  {MELHOR_CONTATO.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <div className="field-label">Observações adicionais</div>
                <textarea
                  name="observacoes"
                  value={formData.detalhes.observacoes || ''}
                  onChange={handleDetalheChange}
                />
              </div>

              <div className="field-group">
                <div className="field-label">Restrição de acesso ao local</div>
                <input
                  name="restricao_acesso"
                  value={formData.detalhes.restricao_acesso || ''}
                  onChange={handleDetalheChange}
                />
              </div>

              <div className="field-group">
                <div className="field-label">Riscos ou requisitos de segurança</div>
                <input
                  name="risco_seguranca"
                  value={formData.detalhes.risco_seguranca || ''}
                  onChange={handleDetalheChange}
                />
              </div>
            </div>
          )}

          <button type="submit" className="publish-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Publicando...' : 'Publicar serviço'}
          </button>
        </form>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.isError ? 'error' : 'success'}
          onClose={() => setToast(null)}
        />
      )}

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />
    </>
  );
};

export default PostService;
