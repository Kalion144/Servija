import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  atualizarUsuario,
  atualizarPerfilProfissional,
  obterDadosUsuario,
} from '../../services/api';

const DEFAULT_AVATAR_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238aa0bc'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

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
  const [toastBgColor, setToastBgColor] = useState('#1f2e3a');
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user data
  useEffect(() => {
    if (usuario) {
      const profHabilidades = usuario.perfilProfissional?.habilidades
        ? typeof usuario.perfilProfissional.habilidades === 'string'
          ? JSON.parse(usuario.perfilProfissional.habilidades)
          : usuario.perfilProfissional.habilidades
        : [];

      setFormData({
        nome: usuario.nome || '',
        profissao: usuario.perfilProfissional?.profissao || '',
        bio: usuario.bio || '',
        experiencia: usuario.perfilProfissional?.experiencia || '',
        habilidades: Array.isArray(profHabilidades) ? profHabilidades : [],
        fotoPerfil: usuario.foto || null,
        localizacao: usuario.perfilProfissional?.localizacao || '',
      });
    }
  }, [usuario]);

  const showToast = (message: string, bgColor = '#1f2e3a') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    setToastBgColor(bgColor);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 2800);
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Formato inválido. Use PNG, JPG ou WEBP.', '#b91c1c');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Imagem muito grande! Máximo 5MB.', '#b91c1c');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setFormData((prev) => ({ ...prev, fotoPerfil: imageData }));
      showToast('Foto de perfil atualizada!', '#2c7a6e');
    };
    reader.onerror = () => showToast('Erro ao ler a imagem.', '#b91c1c');
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0)
      handleFileSelect(event.target.files[0]);
  };
  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, fotoPerfil: null }));
    showToast('Foto removida', '#6c757d');
  };

  const addSkill = () => {
    const skill = newSkillInput.trim();
    if (skill === '') {
      showToast('Digite uma habilidade antes de adicionar', '#c2410c');
      return;
    }
    if (
      formData.habilidades.some((s) => s.toLowerCase() === skill.toLowerCase())
    ) {
      showToast('Essa habilidade já está na lista', '#e07c3c');
      return;
    }
    if (skill.length > 50) {
      showToast('Máximo de 50 caracteres', '#c2410c');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      habilidades: [...prev.habilidades, skill],
    }));
    setNewSkillInput('');
    showToast(`"${skill}" adicionada`, '#2c7a6e');
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      habilidades: prev.habilidades.filter((_, i) => i !== index),
    }));
    showToast('Habilidade removida', '#4b6e8a');
  };

  const validateForm = () => {
    if (formData.nome.trim() === '') {
      showToast('Por favor, informe seu nome completo', '#b91c1c');
      return false;
    }
    if (formData.nome.length < 3) {
      showToast('Nome muito curto, mínimo 3 caracteres', '#b91c1c');
      return false;
    }
    if (formData.profissao.trim() === '') {
      showToast('Informe sua profissão ou especialidade', '#b91c1c');
      return false;
    }
    return true;
  };

  const saveProfile = async () => {
    if (!validateForm()) return;
    try {
      // Update user table data
      const userUpdate = await atualizarUsuario({
        nome: formData.nome.trim(),
        bio: formData.bio.trim(),
        foto: formData.fotoPerfil,
      });

      if (userUpdate.usuario) {
        updateUser(userUpdate.usuario);
      }

      // Update professional profile
      await atualizarPerfilProfissional({
        profissao: formData.profissao.trim(),
        experiencia: formData.experiencia.trim(),
        habilidades: formData.habilidades,
        localizacao: formData.localizacao,
      });

      // Refresh user data (including updated perfilProfissional)
      const { usuario: refreshedUser } = await obterDadosUsuario();
      if (refreshedUser) {
        updateUser(refreshedUser);
      }

      showToast(
        `✅ Perfil salvo! ${formData.nome.trim()} - ${formData.profissao.trim()} | ${formData.habilidades.length} habilidades.`,
        '#1f6e5c'
      );
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      showToast('Erro ao salvar perfil', '#b91c1c');
    }
  };

  const cancelForm = () => {
    if (window.confirm('Tem certeza que deseja cancelar?')) {
      // Reset form to original values
      if (usuario) {
        const profHabilidades = usuario.perfilProfissional?.habilidades
          ? typeof usuario.perfilProfissional.habilidades === 'string'
            ? JSON.parse(usuario.perfilProfissional.habilidades)
            : usuario.perfilProfissional.habilidades
          : [];

        setFormData({
          nome: usuario.nome || '',
          profissao: usuario.perfilProfissional?.profissao || '',
          bio: usuario.bio || '',
          experiencia: usuario.perfilProfissional?.experiencia || '',
          habilidades: Array.isArray(profHabilidades) ? profHabilidades : [],
          fotoPerfil: usuario.foto || null,
          localizacao: usuario.perfilProfissional?.localizacao || '',
        });
      }
      setIsEditing(false);
      showToast('Formulário reiniciado', '#6c757d');
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const styles = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: linear-gradient(135deg, #fff7ed 0%, #ffe4c2 100%);
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, sans-serif;
  padding: 32px 20px;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.profile-card {
  max-width: 820px;
  width: 100%;
  background: #ffffff;
  border-radius: 42px;
  box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.02);
  overflow: hidden;
  transition: transform 0.2s;
}

.form-header {
  background: #ffffff;
  padding: 32px 36px 8px 36px;
  border-bottom: 1px solid #f3e8d9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-header h1 {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(125deg, #9a3412, #ea580c);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  letter-spacing: -0.3px;
}

.form-header .sub {
  color: #7c2d12;
  margin-top: 8px;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-body {
  padding: 24px 36px 32px 36px;
}

.profile-photo-section {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
  margin-bottom: 32px;
  background: #fff7ed;
  padding: 20px 24px;
  border-radius: 32px;
  border: 1px solid #fed7aa;
}

.photo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar-preview {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  background: #fed7aa;
  border: 3px solid #ffffff;
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  transition: all 0.2s;
}

.avatar-placeholder {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: linear-gradient(145deg, #fed7aa, #f97316);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #fff7ed;
  border: 3px solid white;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.photo-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-photo {
  background: #fed7aa;
  border: none;
  padding: 8px 18px;
  border-radius: 60px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #9a3412;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-photo:hover {
  background: #fdba74;
  transform: translateY(-1px);
}

.btn-photo-danger {
  color: #dc2626;
  background: #fee2e2;
}

.btn-photo-danger:hover {
  background: #fca5a5;
}

.photo-info {
  color: #9a3412;
  font-size: 0.8rem;
  max-width: 220px;
}

.form-section {
  margin-bottom: 32px;
  border-radius: 24px;
  background: #fefefe;
  transition: all 0.2s;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #7c2d12;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: "▍";
  font-size: 1.8rem;
  color: #f97316;
}

.field-group {
  margin-bottom: 22px;
}

label {
  font-weight: 600;
  color: #7c2d12;
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  letter-spacing: -0.2px;
}

.label-hint {
  font-weight: normal;
  color: #c2410c;
  font-size: 0.8rem;
  margin-left: 6px;
}

input, textarea, select {
  width: 100%;
  padding: 14px 18px;
  border: 1.5px solid ${isEditing ? '#fed7aa' : '#ffe4c2'};
  border-radius: 24px;
  font-size: 0.95rem;
  font-family: inherit;
  background: ${isEditing ? '#ffffff' : '#fffbeb'};
  transition: all 0.2s;
  outline: none;
  color: #431407;
  cursor: ${isEditing ? 'text' : 'default'};
}

input:focus, textarea:focus, select:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
}

textarea {
  resize: vertical;
  min-height: 90px;
}

.skills-area {
  background: #fff7ed;
  border-radius: 28px;
  padding: 8px 4px 12px 4px;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 18px 0 20px 0;
  align-items: center;
}

.skill-tag {
  background: #ffedd5;
  color: #9a3412;
  padding: 8px 18px;
  border-radius: 40px;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: all 0.2s;
  border: 1px solid #fed7aa;
}

.skill-tag button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #ea580c;
  font-weight: bold;
  padding: 0 4px;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
}

.skill-tag button:hover {
  color: #dc2626;
}

.add-skill {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.add-skill input {
  flex: 2;
  min-width: 160px;
  padding: 12px 16px;
  border-radius: 60px;
}

.btn-add-skill {
  background: #fed7aa;
  border: none;
  padding: 0 20px;
  border-radius: 60px;
  font-weight: 600;
  color: #9a3412;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-add-skill:hover {
  background: #fdba74;
  transform: scale(0.97);
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 12px;
  border-top: 1px solid #ffe4c2;
}

.btn-cancel, .btn-save {
  padding: 12px 28px;
  border-radius: 40px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-family: inherit;
}

.btn-cancel {
  background: #fed7aa;
  color: #9a3412;
  border: 1px solid #fdba74;
}

.btn-cancel:hover {
  background: #fdba74;
  color: #7c2d12;
  transform: translateY(-1px);
}

.btn-save {
  background: linear-gradient(95deg, #ea580c, #f97316);
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.btn-save:hover {
  background: linear-gradient(95deg, #c2410c, #ea580c);
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.1);
}

.toast-message {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  padding: 12px 28px;
  border-radius: 60px;
  font-weight: 500;
  z-index: 1000;
  backdrop-filter: blur(8px);
  background: rgba(124, 45, 18, 0.95);
  font-size: 0.9rem;
  transition: all 0.2s;
  pointer-events: none;
}

@media (max-width: 620px) {
  .form-body {
    padding: 16px 20px 28px 20px;
  }
  .form-header {
    padding: 24px 24px 4px 24px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .profile-photo-section {
    justify-content: center;
    text-align: center;
  }
  .action-buttons {
    flex-direction: column-reverse;
  }
  .btn-cancel, .btn-save {
    width: 100%;
    text-align: center;
  }
  .section-title {
    font-size: 1.35rem;
  }
}

.example-hint {
  font-size: 0.75rem;
  color: #c2410c;
  margin-top: 6px;
  margin-left: 8px;
}

.file-input-hidden {
  display: none;
}

.edit-btn {
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 24px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: linear-gradient(135deg, #ea580c, #c2410c);
  transform: translateY(-2px);
}

.header-left {
  display: flex;
  flex-direction: column;
}
`;

  return (
    <>
      <style>{styles}</style>
      <div
        style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffe4c2 100%)',
          fontFamily: "'Inter', sans-serif",
          padding: '32px 20px',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <div className="profile-card">
          <div className="form-header">
            <div className="header-left">
              <h1>📋 Meu Perfil Profissional</h1>
              <div className="sub">
                Gerencie suas informações para aumentar suas oportunidades
              </div>
            </div>
            <button
              className="edit-btn"
              onClick={() => (isEditing ? cancelForm() : setIsEditing(true))}
            >
              <i className="fas fa-pen"></i>{' '}
              {isEditing ? 'Cancelar' : 'Editar Perfil'}
            </button>
          </div>
          <div className="form-body">
            <div className="profile-photo-section">
              <div className="photo-container">
                <img
                  className="avatar-preview"
                  src={formData.fotoPerfil || DEFAULT_AVATAR_SVG}
                  alt="Foto de perfil"
                  style={{
                    background: formData.fotoPerfil ? '#fff' : '#fed7aa',
                    objectFit: 'cover',
                  }}
                />
                {isEditing && (
                  <div className="photo-actions">
                    <button className="btn-photo" onClick={handleUploadClick}>
                      📷 Upload foto
                    </button>
                    <button
                      className="btn-photo btn-photo-danger"
                      onClick={handleRemovePhoto}
                    >
                      🗑️ Remover
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="file-input-hidden"
                  accept="image/jpeg, image/png, image/jpg, image/webp"
                  onChange={handleFileChange}
                />
              </div>
              <div className="photo-info">
                ⭐ Adicione uma foto de perfil profissional.
                <br />
                Clientes confiam mais em perfis com foto! (PNG, JPG até 5MB)
              </div>
            </div>
            <div className="form-section">
              <div className="section-title">Dados Básicos</div>
              <div className="field-group">
                <label>
                  Seu Nome <span className="label-hint">(obrigatório)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rafael Mendes"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nome: e.target.value }))
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="field-group">
                <label>
                  Profissão / Especialidade{' '}
                  <span className="label-hint">
                    (obrigatório, ex: Eletricista)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Eletricista, Pedreiro, Marceneiro..."
                  value={formData.profissao}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profissao: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                />
                <div className="example-hint">
                  🔧 Ex: Eletricista, Encanador, Pintor, Servente...
                </div>
              </div>
            </div>
            <div className="form-section">
              <div className="section-title">Descrição / Bio</div>
              <div className="field-group">
                <textarea
                  rows={3}
                  placeholder="Conte um pouco sobre você, sua experiência e valores..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  disabled={!isEditing}
                />
                <div className="example-hint">
                  ✨ Dica: mencione diferenciais, valores e o estilo de
                  trabalho!
                </div>
              </div>
            </div>
            <div className="form-section">
              <div className="section-title">
                Experiência <span className="label-hint">(opcional)</span>
              </div>
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
              <div className="section-title">
                📍 Localização <span className="label-hint">(opcional)</span>
              </div>
              <div className="field-group">
                <input
                  type="text"
                  placeholder="Ex: Brasília - DF, São Paulo - SP"
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
                        placeholder="Nova habilidade"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <button className="btn-add-skill" onClick={addSkill}>
                        + Adicionar
                      </button>
                    </div>
                    <div className="example-hint" style={{ marginTop: '12px' }}>
                      💡 Ex: Instalação elétrica, Manutenção corretiva, Leitura
                      de projetos, Atendimento ao cliente.
                    </div>
                  </>
                )}
              </div>
            </div>
            {isEditing && (
              <div className="action-buttons">
                <button className="btn-cancel" onClick={cancelForm}>
                  Cancelar
                </button>
                <button className="btn-save" onClick={saveProfile}>
                  Salvar Perfil
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {toastMessage && (
        <div
          className="toast-message"
          style={{ backgroundColor: toastBgColor }}
        >
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default Profile;
