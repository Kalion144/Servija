
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { atualizarPerfil } from '../../services/api';

const DEFAULT_AVATAR_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238aa0bc'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

const Profile = () => {
  const { usuario } = useAuth();
  const [nome, setNome] = useState(usuario?.nome || '');
  const [profissao, setProfissao] = useState('Eletricista');
  const [bio, setBio] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [skillsArray, setSkillsArray] = useState([
    'Instalação e reparos',
    'Manutenção geral',
    'Design de projetos',
  ]);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastBgColor, setToastBgColor] = useState('#1f2e3a');
  const toastTimeoutRef = useRef(null);
  const [isSavePressed, setIsSavePressed] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (message, bgColor = '#1f2e3a') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    setToastBgColor(bgColor);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 2800);
  };

  const updateAvatarPreview = (imageDataUrl) => {
    if (
      imageDataUrl &&
      (imageDataUrl.startsWith('data:image') || imageDataUrl.startsWith('http'))
    ) {
      setPhotoBase64(imageDataUrl);
    } else {
      setPhotoBase64(null);
    }
  };

  const handleFileSelect = (file) => {
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
      updateAvatarPreview(e.target.result);
      showToast('Foto de perfil atualizada!', '#2c7a6e');
    };
    reader.onerror = () => showToast('Erro ao ler a imagem.', '#b91c1c');
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => fileInputRef.current.click();
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0)
      handleFileSelect(event.target.files[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleRemovePhoto = () => {
    updateAvatarPreview(null);
    showToast('Foto removida', '#6c757d');
  };

  const addSkill = () => {
    const skill = newSkillInput.trim();
    if (skill === '') {
      showToast('Digite uma habilidade antes de adicionar', '#c2410c');
      return;
    }
    if (skillsArray.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      showToast('Essa habilidade já está na lista', '#e07c3c');
      return;
    }
    if (skill.length > 50) {
      showToast('Máximo de 50 caracteres', '#c2410c');
      return;
    }
    setSkillsArray([...skillsArray, skill]);
    setNewSkillInput('');
    showToast(`"${skill}" adicionada`, '#2c7a6e');
  };
  const removeSkill = (index) => {
    setSkillsArray(skillsArray.filter((_, i) => i !== index));
    showToast('Habilidade removida', '#4b6e8a');
  };

  const validateForm = () => {
    if (nome.trim() === '') {
      showToast('Por favor, informe seu nome completo', '#b91c1c');
      return false;
    }
    if (nome.length < 3) {
      showToast('Nome muito curto, mínimo 3 caracteres', '#b91c1c');
      return false;
    }
    if (profissao.trim() === '') {
      showToast('Informe sua profissão ou especialidade', '#b91c1c');
      return false;
    }
    return true;
  };

  const saveProfile = async () => {
    if (!validateForm()) return;
    try {
      await atualizarPerfil({
        nome: nome.trim(),
        profissao: profissao.trim(),
        bio: bio.trim(),
        experiencia: experiencia.trim(),
        habilidades: [...skillsArray],
        fotoPerfil: photoBase64 || null,
        localizacao: 'Brasília - DF',
      });
      showToast(
        `✅ Perfil salvo! ${nome.trim()} - ${profissao.trim()} | ${skillsArray.length} habilidades.`,
        '#1f6e5c'
      );
    } catch (error) {
      console.error(error);
      showToast('Erro ao salvar perfil', '#b91c1c');
    }
    setIsSavePressed(true);
    setTimeout(() => setIsSavePressed(false), 200);
  };

  const cancelForm = () => {
    if (window.confirm('Tem certeza que deseja cancelar?')) {
      setNome(usuario?.nome || '');
      setProfissao('Eletricista');
      setBio('');
      setExperiencia('');
      setSkillsArray([
        'Instalação e reparos',
        'Manutenção geral',
        'Design de projetos',
      ]);
      setNewSkillInput('');
      setPhotoBase64(null);
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
  background: linear-gradient(135deg, #f0f4fa 0%, #d9e2ef 100%);
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, sans-serif;
  padding: 32px 20px;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
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

.profile-card:hover {
  transform: scale(1.01);
}

.form-header {
  background: #ffffff;
  padding: 32px 36px 8px 36px;
  border-bottom: 1px solid #eef2f9;
}

.form-header h1 {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(125deg, #1F3B4C, #2C7A6E);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  letter-spacing: -0.3px;
}

.form-header .sub {
  color: #5d6f88;
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
  background: #fafcff;
  padding: 20px 24px;
  border-radius: 32px;
  border: 1px solid #eef2fa;
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
  background: #e4eaf2;
  border: 3px solid #ffffff;
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  transition: all 0.2s;
}

.avatar-placeholder {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: linear-gradient(145deg, #dce3ec, #cbd5e1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #5f7f9e;
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
  background: #eef2fa;
  border: none;
  padding: 8px 18px;
  border-radius: 60px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #2c5a6e;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-photo:hover {
  background: #e2e8f2;
  transform: translateY(-1px);
}

.btn-photo-danger {
  color: #b43b3b;
}

.photo-info {
  color: #6a7c94;
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
  color: #1f3b4c;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: "▍";
  font-size: 1.8rem;
  color: #2c7a6e;
}

.field-group {
  margin-bottom: 22px;
}

label {
  font-weight: 600;
  color: #2c3e4e;
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  letter-spacing: -0.2px;
}

.label-hint {
  font-weight: normal;
  color: #7e8c9e;
  font-size: 0.8rem;
  margin-left: 6px;
}

input, textarea {
  width: 100%;
  padding: 14px 18px;
  border: 1.5px solid #e2e8f0;
  border-radius: 24px;
  font-size: 0.95rem;
  font-family: inherit;
  background: #ffffff;
  transition: all 0.2s;
  outline: none;
  color: #1e2a3a;
}

input:focus, textarea:focus {
  border-color: #2c7a6e;
  box-shadow: 0 0 0 3px rgba(44, 122, 110, 0.2);
}

textarea {
  resize: vertical;
  min-height: 90px;
}

.skills-area {
  background: #fafcff;
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
  background: #ecfdf5;
  color: #1f5e55;
  padding: 8px 18px;
  border-radius: 40px;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: all 0.2s;
  border: 1px solid #c6f0e6;
}

.skill-tag button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #468b7e;
  font-weight: bold;
  padding: 0 4px;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
}

.skill-tag button:hover {
  color: #b91c1c;
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
  background: #eef2fa;
  border: none;
  padding: 0 20px;
  border-radius: 60px;
  font-weight: 600;
  color: #2c5a6e;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-add-skill:hover {
  background: #e2e9f5;
  transform: scale(0.97);
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 12px;
  border-top: 1px solid #eef2f9;
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
  background: #f1f4f9;
  color: #5b6e8c;
  border: 1px solid #e2e8f0;
}

.btn-cancel:hover {
  background: #e9edf4;
  color: #2c3e4e;
  transform: translateY(-1px);
}

.btn-save {
  background: linear-gradient(95deg, #1f4e5f, #2c6b5e);
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.btn-save:hover {
  background: linear-gradient(95deg, #184151, #235b4f);
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
  background: rgba(20, 35, 45, 0.95);
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
  color: #8ba0bc;
  margin-top: 6px;
  margin-left: 8px;
}

.file-input-hidden {
  display: none;
}`;

  return (
    <>
      <style>{styles}</style>
      <div
        style={{
          background: 'linear-gradient(135deg, #f0f4fa 0%, #d9e2ef 100%)',
          fontFamily: "'Inter', sans-serif",
          padding: '32px 20px',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div className="profile-card">
          <div className="form-header">
            <h1>📋 Fale sobre você</h1>
            <div className="sub">
              Complete seus dados profissionais e aumente suas oportunidades
            </div>
          </div>
          <div className="form-body">
            <div className="profile-photo-section">
              <div className="photo-container">
                <img
                  className="avatar-preview"
                  src={photoBase64 || DEFAULT_AVATAR_SVG}
                  alt="Foto de perfil"
                  style={{ background: '#eef2fa', objectFit: 'cover' }}
                />
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
                Clientes confiam mais em perfis com foto. (PNG, JPG até 5MB)
              </div>
            </div>
            <div className="form-section">
              <div className="section-title">Identidade</div>
              <div className="field-group">
                <label>
                  Seu Nome <span className="label-hint">(obrigatório)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rafael Mendes"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>
                  Profissão / Especialidade{' '}
                  <span className="label-hint">(ex: Eletricista)</span>
                </label>
                <input
                  type="text"
                  placeholder="Eletricista, Pedreiro, Marceneiro..."
                  value={profissao}
                  onChange={(e) => setProfissao(e.target.value)}
                />
                <div className="example-hint">
                  🔧 Ex: Eletricista, Encanador, Pintor, Servente...
                </div>
              </div>
            </div>
            <div className="form-section">
              <div className="section-title">Descrição (bio)</div>
              <div className="field-group">
                <textarea
                  rows={3}
                  placeholder="Conte um pouco sobre você..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
                <div className="example-hint">
                  ✨ Dica: mencione anos de experiência, diferencial e estilo de
                  trabalho.
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
                  placeholder="Descreva sua experiência..."
                  value={experiencia}
                  onChange={(e) => setExperiencia(e.target.value)}
                />
              </div>
            </div>
            <div className="form-section">
              <div className="section-title">🛠️ Habilidades</div>
              <div className="skills-area">
                <div className="skills-list">
                  {skillsArray.map((skill, idx) => (
                    <div className="skill-tag" key={idx}>
                      {skill}
                      <button onClick={() => removeSkill(idx)}>✕</button>
                    </div>
                  ))}
                </div>
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
                  💡 Ex: Instalação elétrica, Manutenção corretiva, Leitura de
                  projetos, Atendimento ao cliente.
                </div>
              </div>
            </div>
            <div className="action-buttons">
              <button className="btn-cancel" onClick={cancelForm}>
                Cancelar
              </button>
              <button
                className="btn-save"
                onClick={saveProfile}
                style={{ transform: isSavePressed ? 'scale(0.97)' : 'none' }}
              >
                Salvar Perfil
              </button>
            </div>
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
