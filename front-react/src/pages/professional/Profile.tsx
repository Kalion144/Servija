import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { atualizarPerfil } from '../../services/api';

const DEFAULT_AVATAR_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23fed7aa'/%3E%3Cpath fill='%23c2410c' d='M50 55a18 18 0 1 0 0-36 18 18 0 0 0 0 36zm0 8c-18 0-30 9-30 14v4h60v-4c0-5-12-14-30-14z'/%3E%3C/svg%3E";

const UFS_BRASILEIRAS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO',
  'MA','MG','MS','MT','PA','PB','PE','PI','PR',
  'RJ','RN','RO','RR','RS','SC','SE','SP','TO',
];

function validarLocalizacao(valor: string): string | null {
  if (!valor.trim()) return null;
  const match = valor.trim().match(/^(.+?)\s*[-–]\s*([A-Za-z]{2})$/);
  if (!match) return 'Use o formato: Cidade - UF  (ex: Brasília - DF)';
  const uf = match[2].toUpperCase();
  if (!UFS_BRASILEIRAS.includes(uf)) return `"${uf}" não é um estado brasileiro válido`;
  const cidade = match[1].trim();
  if (cidade.length < 2) return 'Nome da cidade muito curto';
  return null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { usuario, refreshUsuario } = useAuth();

  const [nome, setNome] = useState('');
  const [profissao, setProfissao] = useState('');
  const [bio, setBio] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [telefone, setTelefone] = useState('');
  const [valorHora, setValorHora] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [localizacaoErro, setLocalizacaoErro] = useState<string | null>(null);
  const [skillsArray, setSkillsArray] = useState<string[]>([]);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastIsError, setToastIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!usuario) return;
    setNome(usuario.nome || '');
    setPhotoBase64(usuario.foto || null);
    const p = usuario.perfilProfissional;
    if (p) {
      setProfissao(p.profissao || '');
      setBio(usuario.bio || '');
      setExperiencia(p.experiencia || '');
      setTelefone(p.telefone || '');
      setValorHora(p.valor_hora != null ? String(p.valor_hora) : '');
      setLocalizacao(p.localizacao || p.cidade || '');
      if (p.habilidades) {
        try {
          const parsed =
            typeof p.habilidades === 'string'
              ? JSON.parse(p.habilidades)
              : p.habilidades;
          setSkillsArray(Array.isArray(parsed) ? parsed : []);
        } catch {
          setSkillsArray([]);
        }
      }
    }
  }, [usuario]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const showToast = (message: string, isError = false) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    setToastIsError(isError);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 3000);
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      showToast('Formato inválido. Use PNG, JPG ou WEBP.', true);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Imagem muito grande! Máximo 5MB.', true);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoBase64(e.target?.result as string);
      showToast('Foto atualizada!');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addSkill = () => {
    const skill = newSkillInput.trim();
    if (!skill) return;
    if (skillsArray.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      showToast('Habilidade já adicionada', true);
      return;
    }
    setSkillsArray([...skillsArray, skill]);
    setNewSkillInput('');
  };

  const removeSkill = (index: number) =>
    setSkillsArray(skillsArray.filter((_, i) => i !== index));

  const saveProfile = async () => {
    if (nome.trim().length < 3) {
      showToast('Nome muito curto, mínimo 3 caracteres', true);
      return;
    }
    if (!profissao.trim()) {
      showToast('Informe sua profissão ou especialidade', true);
      return;
    }
    const erroLoc = validarLocalizacao(localizacao);
    if (erroLoc) {
      setLocalizacaoErro(erroLoc);
      showToast('Localização inválida: ' + erroLoc, true);
      return;
    }
    setIsSaving(true);
    try {
      await atualizarPerfil({
        nome: nome.trim(),
        profissao: profissao.trim(),
        bio: bio.trim(),
        experiencia: experiencia.trim(),
        habilidades: [...skillsArray],
        fotoPerfil: photoBase64 || null,
        localizacao: localizacao.trim(),
        telefone: telefone.trim(),
        valor_hora: valorHora !== '' ? parseFloat(valorHora) : null,
      });
      await refreshUsuario();
      showToast('✅ Perfil salvo com sucesso!');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao salvar perfil',
        true
      );
    } finally {
      setIsSaving(false);
    }
  };

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f0f4fa; font-family: 'Inter', sans-serif; }

    .top-nav {
      position: sticky; top: 0; z-index: 100;
      background: white;
      padding: 14px 24px;
      display: flex; align-items: center; justify-content: space-between;
      box-shadow: 0 2px 10px rgba(0,0,0,0.07);
    }
    .back-btn {
      display: inline-flex; align-items: center; gap: 8px;
      background: #f0f4fa; border: none; border-radius: 40px;
      padding: 10px 20px; font-size: 0.9rem; font-weight: 600;
      color: #1f3b4c; cursor: pointer; transition: all 0.2s;
    }
    .back-btn:hover { background: #e2e8f0; transform: translateX(-2px); }
    .nav-title { font-size: 1.1rem; font-weight: 700; color: #1f3b4c; }

    .page-wrapper {
      background: linear-gradient(135deg, #f0f4fa 0%, #d9e2ef 100%);
      min-height: calc(100vh - 57px);
      padding: 32px 20px 60px 20px;
      display: flex; justify-content: center; align-items: flex-start;
    }

    .profile-card {
      max-width: 820px; width: 100%;
      background: white; border-radius: 32px;
      box-shadow: 0 20px 40px -12px rgba(0,0,0,0.15);
      overflow: hidden;
    }

    .form-header {
      padding: 28px 36px 20px 36px;
      border-bottom: 1px solid #eef2f9;
    }
    .form-header h1 {
      font-size: 1.7rem; font-weight: 700;
      background: linear-gradient(125deg, #1F3B4C, #2C7A6E);
      background-clip: text; -webkit-background-clip: text; color: transparent;
    }
    .form-header .sub { color: #5d6f88; margin-top: 6px; font-size: 0.9rem; }

    .form-body { padding: 24px 36px 36px 36px; }

    .photo-section {
      display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
      background: #fafcff; border: 1px solid #eef2fa;
      border-radius: 24px; padding: 20px 24px; margin-bottom: 28px;
    }
    .avatar-img {
      width: 100px; height: 100px; border-radius: 50%; object-fit: cover;
      background: #e4eaf2; border: 3px solid white;
      box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    }
    .photo-right { flex: 1; }
    .photo-right p { color: #6a7c94; font-size: 0.82rem; margin-bottom: 12px; }
    .photo-btns { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn-photo {
      background: #eef2fa; border: none; padding: 8px 16px;
      border-radius: 40px; font-size: 0.8rem; font-weight: 600;
      color: #2c5a6e; cursor: pointer; transition: all 0.2s;
    }
    .btn-photo:hover { background: #e0e8f2; }
    .btn-photo-danger { color: #b43b3b; }

    .section-label {
      font-size: 1rem; font-weight: 700; color: #1f3b4c;
      margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;
      padding-bottom: 8px; border-bottom: 2px solid #eef2f9;
    }
    .section-label::before { content: "▍"; color: #2c7a6e; }

    .field-group { margin-bottom: 18px; }
    .field-row { display: flex; gap: 16px; }
    .field-row .field-group { flex: 1; }

    label {
      display: block; margin-bottom: 6px;
      font-weight: 600; font-size: 0.85rem; color: #2c3e4e;
    }
    .label-hint { font-weight: 400; color: #8a9ab0; font-size: 0.8rem; margin-left: 4px; }

    input[type=text], input[type=tel], input[type=number], textarea {
      width: 100%; padding: 12px 16px;
      border: 1.5px solid #e2e8f0; border-radius: 16px;
      font-size: 0.9rem; font-family: inherit; background: white;
      color: #1e2a3a; outline: none; transition: all 0.2s;
    }
    input:focus, textarea:focus {
      border-color: #2c7a6e; box-shadow: 0 0 0 3px rgba(44,122,110,0.15);
    }
    textarea { resize: vertical; min-height: 80px; }

    .skills-wrap {
      background: #fafcff; border-radius: 20px;
      padding: 16px; border: 1px solid #eef2fa;
    }
    .skills-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
    .skill-tag {
      background: #ecfdf5; color: #1f5e55; border: 1px solid #c6f0e6;
      padding: 6px 14px; border-radius: 40px; font-size: 0.85rem;
      font-weight: 500; display: inline-flex; align-items: center; gap: 6px;
    }
    .skill-tag button {
      background: none; border: none; cursor: pointer;
      color: #468b7e; font-size: 1rem; padding: 0 2px; line-height: 1;
      transition: color 0.2s;
    }
    .skill-tag button:hover { color: #b91c1c; }
    .add-skill { display: flex; gap: 10px; }
    .add-skill input { flex: 1; }
    .btn-add-skill {
      background: #eef2fa; border: none; padding: 0 18px;
      border-radius: 40px; font-weight: 600; color: #2c5a6e;
      cursor: pointer; white-space: nowrap; transition: all 0.2s;
    }
    .btn-add-skill:hover { background: #e2e9f5; }

    .form-section { margin-bottom: 28px; }

    .action-buttons {
      display: flex; justify-content: flex-end; gap: 12px;
      padding-top: 20px; border-top: 1px solid #eef2f9; margin-top: 8px;
    }
    .btn-cancel {
      padding: 12px 24px; border-radius: 40px;
      background: #f1f4f9; color: #5b6e8c;
      border: 1px solid #e2e8f0; font-weight: 600; cursor: pointer;
      transition: all 0.2s; font-family: inherit; font-size: 0.9rem;
    }
    .btn-cancel:hover { background: #e5eaf2; }
    .btn-save {
      padding: 12px 28px; border-radius: 40px;
      background: linear-gradient(95deg, #1f4e5f, #2c6b5e);
      color: white; border: none; font-weight: 700;
      cursor: pointer; transition: all 0.2s;
      font-family: inherit; font-size: 0.9rem; min-width: 130px;
    }
    .btn-save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
    .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

    .toast-message {
      position: fixed; bottom: 28px; left: 50%;
      transform: translateX(-50%);
      color: white; padding: 12px 28px; border-radius: 40px;
      font-weight: 600; font-size: 0.9rem; z-index: 9999;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    @media (max-width: 620px) {
      .form-body { padding: 16px 18px 28px; }
      .form-header { padding: 20px 18px 14px; }
      .field-row { flex-direction: column; gap: 0; }
      .action-buttons { flex-direction: column-reverse; }
      .btn-cancel, .btn-save { width: 100%; text-align: center; }
    }

    .file-input-hidden { display: none; }
  `;

  return (
    <>
      <style>{styles}</style>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      />

      <div className="top-nav">
        <button className="back-btn" onClick={() => navigate('/professional/home')}>
          <i className="fas fa-arrow-left" /> Voltar
        </button>
        <span className="nav-title">Meu Perfil</span>
        <div style={{ width: 80 }} />
      </div>

      <div className="page-wrapper">
        <div className="profile-card">
          <div className="form-header">
            <h1>Fale sobre você</h1>
            <div className="sub">
              Complete seus dados profissionais e aumente suas oportunidades
            </div>
          </div>

          <div className="form-body">
            <div className="photo-section">
              <img
                className="avatar-img"
                src={photoBase64 || DEFAULT_AVATAR_SVG}
                alt="Foto de perfil"
              />
              <div className="photo-right">
                <p>⭐ Perfis com foto recebem mais propostas. (PNG, JPG até 5MB)</p>
                <div className="photo-btns">
                  <button className="btn-photo" onClick={() => fileInputRef.current?.click()}>
                    📷 Upload foto
                  </button>
                  {photoBase64 && (
                    <button
                      className="btn-photo btn-photo-danger"
                      onClick={() => { setPhotoBase64(null); showToast('Foto removida'); }}
                    >
                      🗑️ Remover
                    </button>
                  )}
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="file-input-hidden"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileChange}
              />
            </div>

            <div className="form-section">
              <div className="section-label">Identidade</div>
              <div className="field-row">
                <div className="field-group">
                  <label>Nome completo <span className="label-hint">(obrigatório)</span></label>
                  <input
                    type="text"
                    placeholder="Ex: Rafael Mendes"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>Profissão / Especialidade <span className="label-hint">(obrigatório)</span></label>
                  <input
                    type="text"
                    placeholder="Ex: Eletricista, Encanador, Pintor..."
                    value={profissao}
                    onChange={(e) => setProfissao(e.target.value)}
                  />
                </div>
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label>Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="(61) 99999-9999"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>Cidade / Localização</label>
                  <input
                    type="text"
                    placeholder="Ex: Brasília - DF"
                    value={localizacao}
                    onChange={(e) => {
                      setLocalizacao(e.target.value);
                      setLocalizacaoErro(null);
                    }}
                    onBlur={() => setLocalizacaoErro(validarLocalizacao(localizacao))}
                    style={localizacaoErro ? { borderColor: '#dc2626', boxShadow: '0 0 0 3px rgba(220,38,38,0.15)' } : {}}
                  />
                  {localizacaoErro && (
                    <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: 5, marginLeft: 8 }}>
                      ⚠️ {localizacaoErro}
                    </div>
                  )}
                  {!localizacaoErro && localizacao && (
                    <div style={{ color: '#16a34a', fontSize: '0.78rem', marginTop: 5, marginLeft: 8 }}>
                      ✓ Localização válida
                    </div>
                  )}
                </div>
              </div>
              <div className="field-group" style={{ maxWidth: 220 }}>
                <label>Valor por hora (R$)</label>
                <input
                  type="number"
                  placeholder="Ex: 80"
                  value={valorHora}
                  onChange={(e) => setValorHora(e.target.value)}
                  min={0}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-label">Sobre você</div>
              <div className="field-group">
                <label>Apresentação <span className="label-hint">(bio)</span></label>
                <textarea
                  rows={3}
                  placeholder="Conte um pouco sobre você, seu diferencial e estilo de trabalho..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Experiência profissional</label>
                <textarea
                  rows={3}
                  placeholder="Descreva sua experiência, certificações ou empresas onde trabalhou..."
                  value={experiencia}
                  onChange={(e) => setExperiencia(e.target.value)}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-label">Habilidades</div>
              <div className="skills-wrap">
                {skillsArray.length > 0 && (
                  <div className="skills-list">
                    {skillsArray.map((skill, idx) => (
                      <div className="skill-tag" key={idx}>
                        {skill}
                        <button onClick={() => removeSkill(idx)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                {skillsArray.length === 0 && (
                  <p style={{ color: '#8a9ab0', fontSize: '0.85rem', marginBottom: 12 }}>
                    Adicione suas habilidades abaixo
                  </p>
                )}
                <div className="add-skill">
                  <input
                    type="text"
                    placeholder="Ex: Instalação elétrica, Hidráulica..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <button className="btn-add-skill" onClick={addSkill}>
                    + Adicionar
                  </button>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-cancel" onClick={() => navigate('/professional/home')}>
                Cancelar
              </button>
              <button className="btn-save" onClick={saveProfile} disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar Perfil'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div
          className="toast-message"
          style={{ background: toastIsError ? '#b91c1c' : '#1f6e5c' }}
        >
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default Profile;
