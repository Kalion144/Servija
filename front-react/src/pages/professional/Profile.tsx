import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  atualizarUsuario,
  atualizarPerfilProfissional,
  obterDadosUsuario,
  uploadSingleImage,
} from '../../services/api';

const API_URL = 'http://localhost:3000';

const DEFAULT_AVATAR_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23c2410c'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

const Profile = () => {
  const navigate = useNavigate();
  const { usuario, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    profissao: '',
    bio: '',
    experiencia: '',
    habilidades: [] as string[],
    fotoPerfil: null as string | null,
    localizacao: '',
  });
  const [newSkillInput, setNewSkillInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastBgColor, setToastBgColor] = useState('#7c2d12');
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (usuario) {
      const profHabilidades = usuario.perfilProfissional?.habilidades
        ? typeof usuario.perfilProfissional.habilidades === 'string'
          ? JSON.parse(usuario.perfilProfissional.habilidades)
          : usuario.perfilProfissional.habilidades
        : [];

      // Se a foto começar com /uploads/, adicionar o base URL
      let fotoPerfil = usuario.foto || null;
      if (fotoPerfil && fotoPerfil.startsWith('/uploads/')) {
        fotoPerfil = `${API_URL}${fotoPerfil}`;
      }

      setFormData({
        nome: usuario.nome || '',
        profissao: usuario.perfilProfissional?.profissao || '',
        bio: usuario.bio || '',
        experiencia: usuario.perfilProfissional?.experiencia || '',
        habilidades: Array.isArray(profHabilidades) ? profHabilidades : [],
        fotoPerfil: fotoPerfil,
        localizacao: usuario.perfilProfissional?.localizacao || '',
      });
    }
  }, [usuario]);

  const showToast = (message: string, bgColor = '#7c2d12') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    setToastBgColor(bgColor);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 2800);
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Formato inválido! Use PNG, JPG ou WEBP.', '#dc2626');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Arquivo muito grande! Máximo 5MB.', '#dc2626');
      return;
    }

    try {
      const result = await uploadSingleImage(file);
      setFormData((prev) => ({
        ...prev,
        fotoPerfil: `${API_URL}${result.url}`,
      }));
      showToast('Foto de perfil atualizada!', '#16a34a');
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : 'Erro ao fazer upload';
      showToast(message, '#dc2626');
    }
  };

  const addSkill = () => {
    const skill = newSkillInput.trim();
    if (skill === '') {
      showToast('Digite uma habilidade!', '#c2410c');
      return;
    }
    if (
      formData.habilidades.some((s) => s.toLowerCase() === skill.toLowerCase())
    ) {
      showToast('Essa habilidade já existe!', '#c2410c');
      return;
    }
    if (skill.length > 50) {
      showToast('Máximo de 50 caracteres!', '#c2410c');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      habilidades: [...prev.habilidades, skill],
    }));
    setNewSkillInput('');
    showToast(`Habilidade "${skill}" adicionada!`, '#16a34a');
  };

  const removeSkill = (index: number) => {
    const removed = formData.habilidades[index];
    setFormData((prev) => ({
      ...prev,
      habilidades: prev.habilidades.filter((_, i) => i !== index),
    }));
    showToast(`Habilidade "${removed}" removida!`, '#7c2d12');
  };

  const validateForm = () => {
    if (formData.nome.trim() === '') {
      showToast('Digite seu nome!', '#dc2626');
      return false;
    }
    if (formData.nome.length < 3) {
      showToast('Nome muito curto!', '#dc2626');
      return false;
    }
    if (formData.profissao.trim() === '') {
      showToast('Informe sua profissão!', '#dc2626');
      return false;
    }
    return true;
  };

  const saveProfile = async () => {
    if (!validateForm()) return;
    try {
      // Strip API_URL from foto if present
      let fotoToSave = formData.fotoPerfil;
      if (fotoToSave && fotoToSave.startsWith(API_URL)) {
        fotoToSave = fotoToSave.substring(API_URL.length);
      }

      const userUpdate = await atualizarUsuario({
        nome: formData.nome.trim(),
        bio: formData.bio.trim(),
        foto: fotoToSave,
      });
      if (userUpdate.usuario) updateUser(userUpdate.usuario);
      await atualizarPerfilProfissional({
        profissao: formData.profissao.trim(),
        experiencia: formData.experiencia.trim(),
        habilidades: formData.habilidades,
        localizacao: formData.localizacao,
      });
      const { usuario: refreshedUser } = await obterDadosUsuario();
      if (refreshedUser) updateUser(refreshedUser);
      showToast('✅ Perfil salvo com sucesso!', '#16a34a');
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      showToast('Erro ao salvar perfil!', '#dc2626');
    }
  };

  const cancelForm = () => {
    if (window.confirm('Deseja realmente cancelar?')) {
      if (usuario) {
        const profHabilidades = usuario.perfilProfissional?.habilidades
          ? typeof usuario.perfilProfissional.habilidades === 'string'
            ? JSON.parse(usuario.perfilProfissional.habilidades)
            : usuario.perfilProfissional.habilidades
          : [];

        // Se a foto começar com /uploads/, adicionar o base URL
        let fotoPerfil = usuario.foto || null;
        if (fotoPerfil && fotoPerfil.startsWith('/uploads/')) {
          fotoPerfil = `${API_URL}${fotoPerfil}`;
        }

        setFormData({
          nome: usuario.nome || '',
          profissao: usuario.perfilProfissional?.profissao || '',
          bio: usuario.bio || '',
          experiencia: usuario.perfilProfissional?.experiencia || '',
          habilidades: Array.isArray(profHabilidades) ? profHabilidades : [],
          fotoPerfil: fotoPerfil,
          localizacao: usuario.perfilProfissional?.localizacao || '',
        });
      }
      setIsEditing(false);
      showToast('Alterações canceladas!', '#7c2d12');
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
    body { background: #fff7ed; min-height: 100vh; }
    .profile-card { max-width: 900px; width: 100%; background: white; border-radius: 40px; box-shadow: 0 25px 45px -12px rgba(0,0,0,0.12); overflow: hidden; margin: 32px auto; }
    .top-nav { background: linear-gradient(135deg, #f97316, #ea580c); padding: 20px 36px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .nav-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
    .nav-btn { background: rgba(255,255,255,0.25); border: none; color: white; padding: 10px 20px; border-radius: 60px; cursor: pointer; font-weight: 700; font-size: 0.9rem; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
    .nav-btn:hover { background: rgba(255,255,255,0.35); transform: translateY(-1px); }
    .nav-btn.active { background: white; color: #ea580c; }
    .form-header { background: white; padding: 28px 36px 12px; border-bottom: 1px solid #ffe4c2; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .form-header h1 { font-size: 1.9rem; font-weight: 800; background: linear-gradient(125deg, #7c2d12, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.3px; }
    .edit-btn { background: linear-gradient(135deg, #f97316, #ea580c); border: none; color: white; padding: 12px 24px; border-radius: 60px; cursor: pointer; font-weight: 700; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
    .edit-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(249,115,22,0.3); }
    .form-body { padding: 32px 40px 40px; }
    .profile-photo-section { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; margin-bottom: 36px; background: #fff7ed; padding: 24px 28px; border-radius: 30px; border: 1px solid #fed7aa; }
    .photo-container { display: flex; flex-direction: column; align-items: center; gap: 14px; }
    .avatar-preview { width: 130px; height: 130px; border-radius: 50%; object-fit: cover; background: #fed7aa; border: 4px solid white; box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
    .avatar-placeholder { width: 130px; height: 130px; border-radius: 50%; background: linear-gradient(145deg, #fed7aa, #f97316); display: flex; align-items: center; justify-content: center; font-size: 4rem; color: #fff7ed; border: 4px solid white; box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
    .photo-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
    .btn-photo { background: #fed7aa; border: none; padding: 10px 20px; border-radius: 60px; font-size: 0.9rem; font-weight: 700; color: #7c2d12; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
    .btn-photo:hover { background: #fdba74; transform: translateY(-1px); }
    .btn-photo-danger { color: #dc2626; background: #fee2e2; }
    .btn-photo-danger:hover { background: #fca5a5; }
    .photo-info { color: #7c2d12; font-size: 0.95rem; max-width: 320px; line-height: 1.6; }
    .form-section { margin-bottom: 34px; }
    .section-title { font-size: 1.45rem; font-weight: 800; color: #7c2d12; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    .field-group { margin-bottom: 24px; }
    label { font-weight: 700; color: #7c2d12; display: block; margin-bottom: 10px; font-size: 1rem; }
    .label-hint { font-weight: 600; color: #c2410c; font-size: 0.85rem; margin-left: 8px; }
    input, textarea, select { width: 100%; padding: 15px 20px; border: 1.5px solid ${isEditing ? '#fed7aa' : '#ffe4c2'}; border-radius: 22px; font-size: 1rem; font-family: inherit; background: ${isEditing ? '#ffffff' : '#fffbeb'}; transition: all 0.2s; outline: none; color: #431407; cursor: ${isEditing ? 'text' : 'default'}; }
    input:focus, textarea:focus, select:focus { border-color: #f97316; box-shadow: 0 0 0 4px rgba(249,115,22,0.15); background: white; }
    textarea { resize: vertical; min-height: 110px; }
    .skills-area { background: #fff7ed; border-radius: 28px; padding: 24px; border: 1px solid #fed7aa; }
    .skills-list { display: flex; flex-wrap: wrap; gap: 12px; margin: 12px 0 20px; align-items: center; }
    .skill-tag { background: #ffedd5; color: #7c2d12; padding: 9px 20px; border-radius: 60px; font-size: 0.95rem; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: all 0.2s; border: 1px solid #fed7aa; }
    .skill-tag button { background: none; border: none; font-size: 1.35rem; cursor: pointer; color: #ea580c; font-weight: 700; padding: 0 6px; transition: color 0.2s; display: inline-flex; align-items: center; }
    .skill-tag button:hover { color: #dc2626; }
    .add-skill { display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap; }
    .add-skill input { flex: 2; min-width: 200px; padding: 13px 18px; border-radius: 60px; }
    .btn-add-skill { background: linear-gradient(135deg, #f97316, #ea580c); border: none; padding: 13px 26px; border-radius: 60px; font-weight: 800; color: white; cursor: pointer; transition: all 0.2s; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; }
    .btn-add-skill:hover { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(249,115,22,0.3); }
    .action-buttons { display: flex; justify-content: flex-end; gap: 16px; margin-top: 40px; padding-top: 22px; border-top: 1px solid #ffe4c2; }
    .btn-cancel, .btn-save { padding: 14px 32px; border-radius: 60px; font-weight: 800; font-size: 1rem; cursor: pointer; transition: all 0.2s; border: none; font-family: inherit; display: flex; align-items: center; gap: 8px; }
    .btn-cancel { background: #fed7aa; color: #7c2d12; border: 1px solid #fdba74; }
    .btn-cancel:hover { background: #fdba74; color: #431407; transform: translateY(-1px); }
    .btn-save { background: linear-gradient(95deg, #ea580c, #f97316); color: white; box-shadow: 0 4px 14px rgba(249,115,22,0.25); }
    .btn-save:hover { background: linear-gradient(95deg, #c2410c, #ea580c); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(249,115,22,0.35); }
    .toast-message { position: fixed; top: 24px; right: 24px; color: white; padding: 14px 26px; border-radius: 60px; font-weight: 700; z-index: 9999; background: rgba(124,45,18,0.95); font-size: 0.95rem; transition: all 0.2s; box-shadow: 0 6px 18px rgba(0,0,0,0.15); animation: fadeIn 0.2s ease; }
    @keyframes fadeIn { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform: translateY(0); } }
    @media (max-width: 768px) {
      .top-nav { padding: 18px 20px; }
      .form-body { padding: 22px 20px 32px; }
      .form-header { padding: 22px 20px 12px; }
      .profile-photo-section { justify-content: center; text-align: center; flex-direction: column; padding: 22px 20px; }
      .action-buttons { flex-direction: column-reverse; }
      .btn-cancel, .btn-save { width: 100%; justify-content: center; }
      .section-title { font-size: 1.25rem; }
      .avatar-preview, .avatar-placeholder { width: 110px; height: 110px; font-size: 3.2rem; }
    }
    .file-input-hidden { display: none; }
  `;

  return (
    <>
      <style>{styles}</style>
      <div
        style={{
          background: '#fff7ed',
          minHeight: '100vh',
          paddingBottom: '40px',
        }}
      >
        <div className="profile-card">
          <div className="form-header">
            <div>
              <h1>⚙️ Meu Perfil Profissional</h1>
              <p
                style={{
                  color: '#9a3412',
                  marginTop: '6px',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                }}
              >
                Mantenha seus dados atualizados!
              </p>
            </div>
            <button
              className="edit-btn"
              onClick={() => (isEditing ? cancelForm() : setIsEditing(true))}
            >
              <i className="fas fa-pen"></i>
              {isEditing ? ' Cancelar' : ' Editar Perfil'}
            </button>
          </div>
          <div className="form-body">
            <div className="profile-photo-section">
              <div className="photo-container">
                {formData.fotoPerfil ? (
                  <img
                    className="avatar-preview"
                    src={formData.fotoPerfil}
                    alt="Foto de perfil"
                  />
                ) : (
                  <div className="avatar-placeholder">👤</div>
                )}
                {isEditing && (
                  <>
                    <div className="photo-actions">
                      <button
                        className="btn-photo"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        📷 Escolher Foto
                      </button>
                      {formData.fotoPerfil && (
                        <button
                          className="btn-photo btn-photo-danger"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              fotoPerfil: null,
                            }));
                            showToast('Foto removida!', '#7c2d12');
                          }}
                        >
                          🗑️ Remover
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="file-input-hidden"
                      accept="image/jpeg, image/png, image/jpg, image/webp"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0)
                          handleFileSelect(e.target.files[0]);
                      }}
                    />
                  </>
                )}
              </div>
              <div className="photo-info">
                ⭐ Adicione uma foto profissional para se destacar!
                <br />
                Clientes confiam mais em perfis com foto (PNG, JPG até 5MB)
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">📝 Dados Básicos</div>
              <div className="field-group">
                <label>
                  Nome Completo{' '}
                  <span className="label-hint">(obrigatório)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: José da Silva"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nome: e.target.value }))
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="field-group">
                <label>
                  Profissão / Área{' '}
                  <span className="label-hint">(obrigatório)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Eletricista, Pedreiro, Pintor"
                  value={formData.profissao}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profissao: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">✨ Sobre Você</div>
              <div className="field-group">
                <textarea
                  rows={4}
                  placeholder="Conte um pouco sobre sua experiência e valores..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">💼 Experiência</div>
              <div className="field-group">
                <textarea
                  rows={3}
                  placeholder="Descreva sua experiência profissional..."
                  value={formData.experiencia}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      experiencia: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">📍 Localização</div>
              <div className="field-group">
                <input
                  type="text"
                  placeholder="Ex: São Paulo - SP"
                  value={formData.localizacao}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      localizacao: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">🛠️ Habilidades</div>
              <div className="skills-area">
                <div className="skills-list">
                  {formData.habilidades.length === 0 && !isEditing && (
                    <div style={{ color: '#9a3412', padding: '10px 0' }}>
                      Nenhuma habilidade cadastrada ainda
                    </div>
                  )}
                  {formData.habilidades.map((skill, idx) => (
                    <div className="skill-tag" key={idx}>
                      {skill}
                      {isEditing && (
                        <button onClick={() => removeSkill(idx)}>✕</button>
                      )}
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <>
                    <div className="add-skill">
                      <input
                        type="text"
                        placeholder="Adicione uma nova habilidade"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <button className="btn-add-skill" onClick={addSkill}>
                        <i className="fas fa-plus"></i> Adicionar
                      </button>
                    </div>
                    <div
                      style={{
                        marginTop: '16px',
                        color: '#9a3412',
                        fontSize: '0.85rem',
                      }}
                    >
                      💡 Ex: Instalação elétrica, Manutenção corretiva,
                      Atendimento ao cliente
                    </div>
                  </>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="action-buttons">
                <button className="btn-cancel" onClick={cancelForm}>
                  <i className="fas fa-times"></i> Cancelar
                </button>
                <button className="btn-save" onClick={saveProfile}>
                  <i className="fas fa-check"></i> Salvar Perfil
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="toast-message" style={{ background: toastBgColor }}>
          {toastMessage}
        </div>
      )}

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
    </>
  );
};

export default Profile;
