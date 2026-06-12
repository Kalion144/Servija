import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { atualizarOnboarding, uploadFotoPerfil } from '../../services/api';
import { OnboardingStep } from '../../lib/types';
import {
  EXPERIENCIAS,
  PROFISSOES,
  HABILIDADES,
  TIPOS_CLIENTE,
  PREFERENCIAS_BUSCA,
  ESTADOS_BR,
} from '../../lib/onboardingOptions';

const STEPS: OnboardingStep[] = ['dados', 'identidade', 'documentos', 'especifico'];

const STEP_LABELS: Record<OnboardingStep, string> = {
  dados: 'Dados pessoais',
  identidade: 'Verificação de identidade',
  documentos: 'Documentos',
  especifico: 'Perfil',
};

interface OnboardingFlowProps {
  userType: 'CLIENTE' | 'PROFISSIONAL';
}

const API_URL = 'http://localhost:3000';

export default function OnboardingFlow({ userType }: OnboardingFlowProps) {
  const navigate = useNavigate();
  const { usuario, updateUser, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<OnboardingStep>('dados');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fotoPreview, setFotoPreview] = useState<string | null>(
    usuario?.foto ? `${API_URL}${usuario.foto}` : null,
  );

  const missing = usuario?.missingFields ?? [];

  const [dados, setDados] = useState({
    telefone: usuario?.telefone ?? '',
    cpf: usuario?.cpf ?? '',
    cidade: usuario?.cidade ?? '',
    estado: usuario?.estado ?? '',
  });

  const [codigoSms, setCodigoSms] = useState('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  const [profissional, setProfissional] = useState({
    profissao: usuario?.perfilProfissional?.profissao ?? '',
    experiencia: usuario?.perfilProfissional?.experiencia ?? '',
    habilidades: parseJsonArray(usuario?.perfilProfissional?.habilidades),
  });

  const [cliente, setCliente] = useState({
    tipo_cliente: usuario?.perfilCliente?.tipo_cliente ?? '',
    preferencias_busca: parseJsonArray(usuario?.perfilCliente?.preferencias_busca),
  });

  const isClient = userType === 'CLIENTE';
  const accent = isClient ? '#2563eb' : '#f97316';
  const homeRoute = isClient ? '/client/home' : '/professional/home';
  const stepIndex = STEPS.indexOf(step);

  function parseJsonArray(value?: string | null): string[] {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  function needsField(field: string) {
    return missing.includes(field);
  }

  function toggleArrayItem(arr: string[], item: string): string[] {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
  }

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  async function uploadFotoIfNeeded() {
    if (!fotoFile) return;
    const res = await uploadFotoPerfil(fotoFile);
    if (res.usuario) await updateUser(res.usuario);
  }

  function validateDados(): boolean {
    if (needsField('foto') && !fotoFile && !usuario?.foto) {
      setError('Envie uma foto de perfil');
      return false;
    }
    if (needsField('telefone') && !dados.telefone.trim()) {
      setError('Informe seu telefone');
      return false;
    }
    if (needsField('cpf') && !dados.cpf.trim()) {
      setError('Informe seu CPF');
      return false;
    }
    if (needsField('cidade') && !dados.cidade.trim()) {
      setError('Informe sua cidade');
      return false;
    }
    if (needsField('estado') && !dados.estado) {
      setError('Selecione seu estado');
      return false;
    }
    setError('');
    return true;
  }

  function validateEspecifico(): boolean {
    if (userType === 'PROFISSIONAL') {
      if (needsField('profissao') && !profissional.profissao) {
        setError('Selecione sua profissão');
        return false;
      }
      if (needsField('experiencia') && !profissional.experiencia) {
        setError('Selecione sua experiência');
        return false;
      }
      if (needsField('habilidades') && profissional.habilidades.length === 0) {
        setError('Selecione ao menos uma habilidade');
        return false;
      }
    } else {
      if (needsField('tipo_cliente') && !cliente.tipo_cliente) {
        setError('Selecione o tipo de cliente');
        return false;
      }
      if (needsField('preferencias_busca') && cliente.preferencias_busca.length === 0) {
        setError('Selecione ao menos uma preferência de busca');
        return false;
      }
    }
    setError('');
    return true;
  }

  async function handleNext() {
    setError('');

    if (step === 'dados') {
      if (!validateDados()) return;
      setLoading(true);
      try {
        if (fotoFile) await uploadFotoIfNeeded();
        const payload: Record<string, unknown> = {};
        if (needsField('telefone') || dados.telefone) payload.telefone = dados.telefone;
        if (needsField('cpf') || dados.cpf) payload.cpf = dados.cpf;
        if (needsField('cidade') || dados.cidade) payload.cidade = dados.cidade;
        if (needsField('estado') || dados.estado) payload.estado = dados.estado;

        if (Object.keys(payload).length > 0) {
          const res = await atualizarOnboarding(payload);
          if (res.usuario) await updateUser(res.usuario);
        }
        setStep('identidade');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 'identidade') {
      if (codigoSms.length < 4) {
        setError('Digite o código de 4 dígitos (simulação)');
        return;
      }
      setStep('documentos');
      return;
    }

    if (step === 'documentos') {
      setStep('especifico');
      return;
    }

    if (step === 'especifico') {
      if (!validateEspecifico()) return;
      setLoading(true);
      try {
        const payload =
          userType === 'PROFISSIONAL'
            ? {
                profissao: profissional.profissao,
                experiencia: profissional.experiencia,
                habilidades: profissional.habilidades,
                telefone: dados.telefone || usuario?.telefone,
                cidade: dados.cidade || usuario?.cidade,
                estado: dados.estado || usuario?.estado,
              }
            : {
                tipo_cliente: cliente.tipo_cliente,
                preferencias_busca: cliente.preferencias_busca,
              };

        const res = await atualizarOnboarding(payload);
        if (res.usuario) await updateUser(res.usuario);
        await refreshUser();
        navigate(homeRoute, { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao finalizar cadastro');
      } finally {
        setLoading(false);
      }
    }
  }

  function handleBack() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  const showDadosFields =
    needsField('foto') ||
    needsField('telefone') ||
    needsField('cpf') ||
    needsField('cidade') ||
    needsField('estado');

  const showProfFields =
    userType === 'PROFISSIONAL' &&
    (needsField('profissao') || needsField('experiencia') || needsField('habilidades'));

  const showClientFields =
    userType === 'CLIENTE' &&
    (needsField('tipo_cliente') || needsField('preferencias_busca'));

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <div className={`logo ${isClient ? 'client' : 'professional'}`}>
            Servijá<span>.</span>
          </div>
          <h2>Complete seu perfil</h2>
          <p>Etapa {stepIndex + 1} de {STEPS.length}: {STEP_LABELS[step]}</p>
        </div>

        <div className="onboarding-progress">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`onboarding-step-dot ${i <= stepIndex ? 'active' : ''}`}
              style={{ background: i <= stepIndex ? accent : undefined }}
            />
          ))}
        </div>

        {error && <div className="onboarding-error">{error}</div>}

        {step === 'dados' && (
          <div className="onboarding-form">
            {!showDadosFields && (
              <p className="onboarding-info">Seus dados básicos já estão completos. Clique em continuar.</p>
            )}

            {needsField('foto') && (
              <div className="onboarding-foto">
                <div
                  className="onboarding-foto-preview"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ borderColor: accent }}
                >
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Preview" />
                  ) : (
                    <span><i className="fas fa-camera"></i> Adicionar foto</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFotoChange}
                />
              </div>
            )}

            {needsField('telefone') && (
              <div className="onboarding-field">
                <label>Telefone</label>
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={dados.telefone}
                  onChange={(e) => setDados({ ...dados, telefone: e.target.value })}
                />
              </div>
            )}

            {needsField('cpf') && (
              <div className="onboarding-field">
                <label>CPF</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={dados.cpf}
                  onChange={(e) => setDados({ ...dados, cpf: e.target.value })}
                />
              </div>
            )}

            {(needsField('cidade') || needsField('estado')) && (
              <div className="onboarding-row">
                {needsField('cidade') && (
                  <div className="onboarding-field">
                    <label>Cidade</label>
                    <input
                      type="text"
                      placeholder="Sua cidade"
                      value={dados.cidade}
                      onChange={(e) => setDados({ ...dados, cidade: e.target.value })}
                    />
                  </div>
                )}
                {needsField('estado') && (
                  <div className="onboarding-field">
                    <label>Estado</label>
                    <select
                      value={dados.estado}
                      onChange={(e) => setDados({ ...dados, estado: e.target.value })}
                    >
                      <option value="">UF</option>
                      {ESTADOS_BR.map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 'identidade' && (
          <div className="onboarding-form">
            <div className="onboarding-mock-banner">
              <i className="fas fa-shield-alt"></i>
              Verificação simulada — sem envio real de SMS
            </div>
            <p className="onboarding-info">
              Enviaremos um código para o número{' '}
              <strong>{dados.telefone || usuario?.telefone || '(seu telefone)'}</strong>
            </p>
            <div className="onboarding-field">
              <label>Código de verificação</label>
              <input
                type="text"
                placeholder="0000"
                maxLength={6}
                value={codigoSms}
                onChange={(e) => setCodigoSms(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <button
              type="button"
              className="onboarding-link-btn"
              onClick={() => setCodigoSms('1234')}
            >
              Usar código de demonstração (1234)
            </button>
          </div>
        )}

        {step === 'documentos' && (
          <div className="onboarding-form">
            <div className="onboarding-mock-banner">
              <i className="fas fa-file-alt"></i>
              Confirmação de documentos — apenas visual (sem upload real)
            </div>
            <div className="onboarding-doc-box">
              <i className="fas fa-id-card"></i>
              <div>
                <strong>Documento de identidade</strong>
                <p>RG ou CNH — validação em breve</p>
              </div>
              <span className="onboarding-badge">Pendente</span>
            </div>
            <div className="onboarding-doc-box">
              <i className="fas fa-home"></i>
              <div>
                <strong>Comprovante de endereço</strong>
                <p>Conta de luz, água ou similar</p>
              </div>
              <span className="onboarding-badge">Pendente</span>
            </div>
            <p className="onboarding-info small">
              Esta etapa é apenas ilustrativa. Clique em continuar para prosseguir.
            </p>
          </div>
        )}

        {step === 'especifico' && userType === 'PROFISSIONAL' && (
          <div className="onboarding-form">
            {!showProfFields && (
              <p className="onboarding-info">Seu perfil profissional já está completo.</p>
            )}

            {needsField('profissao') && (
              <div className="onboarding-field">
                <label>Profissão / tipo de trabalho</label>
                <select
                  value={profissional.profissao}
                  onChange={(e) => setProfissional({ ...profissional, profissao: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {PROFISSOES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}

            {needsField('experiencia') && (
              <div className="onboarding-field">
                <label>Experiência</label>
                <select
                  value={profissional.experiencia}
                  onChange={(e) => setProfissional({ ...profissional, experiencia: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {EXPERIENCIAS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            )}

            {needsField('habilidades') && (
              <div className="onboarding-field">
                <label>Habilidades (selecione uma ou mais)</label>
                <div className="onboarding-chips">
                  {HABILIDADES.map((h) => (
                    <button
                      key={h}
                      type="button"
                      className={`onboarding-chip ${profissional.habilidades.includes(h) ? 'selected' : ''}`}
                      style={
                        profissional.habilidades.includes(h)
                          ? { background: accent, borderColor: accent }
                          : undefined
                      }
                      onClick={() =>
                        setProfissional({
                          ...profissional,
                          habilidades: toggleArrayItem(profissional.habilidades, h),
                        })
                      }
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'especifico' && userType === 'CLIENTE' && (
          <div className="onboarding-form">
            {!showClientFields && (
              <p className="onboarding-info">Seu perfil de cliente já está completo.</p>
            )}

            {needsField('tipo_cliente') && (
              <div className="onboarding-field">
                <label>O que você é?</label>
                <div className="onboarding-tipo-grid">
                  {TIPOS_CLIENTE.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      className={`onboarding-tipo-btn ${cliente.tipo_cliente === t.value ? 'selected' : ''}`}
                      style={
                        cliente.tipo_cliente === t.value
                          ? { borderColor: accent, background: `${accent}15` }
                          : undefined
                      }
                      onClick={() => setCliente({ ...cliente, tipo_cliente: t.value })}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {needsField('preferencias_busca') && (
              <div className="onboarding-field">
                <label>O que você procura?</label>
                <div className="onboarding-chips">
                  {PREFERENCIAS_BUSCA.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`onboarding-chip ${cliente.preferencias_busca.includes(p) ? 'selected' : ''}`}
                      style={
                        cliente.preferencias_busca.includes(p)
                          ? { background: accent, borderColor: accent }
                          : undefined
                      }
                      onClick={() =>
                        setCliente({
                          ...cliente,
                          preferencias_busca: toggleArrayItem(cliente.preferencias_busca, p),
                        })
                      }
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="onboarding-actions">
          {stepIndex > 0 && (
            <button type="button" className="onboarding-btn-secondary" onClick={handleBack}>
              Voltar
            </button>
          )}
          <button
            type="button"
            className="onboarding-btn-primary"
            style={{ background: accent }}
            onClick={handleNext}
            disabled={loading}
          >
            {loading
              ? 'Salvando...'
              : step === 'especifico'
                ? 'Finalizar e entrar'
                : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}
