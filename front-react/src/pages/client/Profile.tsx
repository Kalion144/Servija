
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { atualizarUsuario } from '../../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const { usuario, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    endereco: '',
    cidade: '',
    estado: '',
    dataNascimento: '',
    bio: '',
    notificacoes: 'sim',
    idioma: 'pt',
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    isError: false,
  });
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load user data when usuario changes
  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome || '',
        email: usuario.email || '',
        telefone: usuario.telefone || '',
        cpf: usuario.cpf || '',
        endereco: usuario.endereco || '',
        cidade: usuario.cidade || '',
        estado: usuario.estado || '',
        dataNascimento: usuario.dataNascimento || '',
        bio: usuario.bio || '',
        notificacoes: usuario.notificacoes || 'sim',
        idioma: usuario.idioma || 'pt',
      });
      setAvatar(usuario.foto || null);
    }
  }, [usuario]);

  const displayName = formData.nome.trim() || 'Usuário';

  const showToast = useCallback((message: string, isError = false) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ show: true, message, isError });
    toastTimeout.current = setTimeout(() => {
      setToast({ show: false, message: '', isError: false });
    }, 3000);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const saveProfile = async () => {
    try {
      const result = await atualizarUsuario(formData);
      if (result.usuario) {
        updateUser(result.usuario);
      }
      setIsEditing(false);
      showToast('✅ Perfil atualizado com sucesso!');
    } catch (error) {
      console.error(error);
      showToast('Erro ao atualizar perfil', true);
    }
  };

  const cancelChanges = () => {
    if (usuario) {
      setFormData({
        nome: usuario.nome || '',
        email: usuario.email || '',
        telefone: usuario.telefone || '',
        cpf: usuario.cpf || '',
        endereco: usuario.endereco || '',
        cidade: usuario.cidade || '',
        estado: usuario.estado || '',
        dataNascimento: usuario.dataNascimento || '',
        bio: usuario.bio || '',
        notificacoes: usuario.notificacoes || 'sim',
        idioma: usuario.idioma || 'pt',
      });
      setAvatar(usuario.foto || null);
    }
    setIsEditing(false);
    showToast('Alterações descartadas');
  };

  const openPhotoModal = () => {
    setSelectedPhoto(null);
    setPhotoModalOpen(true);
  };
  const closePhotoModal = () => setPhotoModalOpen(false);
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedPhoto(e.target.files[0]);
  };
  const saveProfilePhoto = () => {
    if (!selectedPhoto) {
      showToast('Selecione uma foto primeiro', true);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setAvatar(imageData);
      setFormData(prev => ({ ...prev, foto: imageData }));
      showToast('✅ Foto de perfil atualizada!');
      closePhotoModal();
    };
    reader.readAsDataURL(selectedPhoto);
  };

  const handleLogout = () => {
    showToast('👋 Até logo! Fazendo logout...');
    setTimeout(() => navigate('/'), 1500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, []);

  const styles = ` * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: 'Inter', sans-serif;
  background: #f5f7fb;
  color: #1e293b;
  min-height: 100vh;
}
.profile-container {
  width: 100%;
  min-height: 100vh;
}
.user-header {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.user-info h2 {
  font-size: 28px;
  margin-bottom: 6px;
}
.user-info p {
  opacity: 0.9;
}
.user-actions {
  display: flex;
  gap: 10px;
}
.icon-btn {
  width: 45px;
  height: 45px;
  border: none;
  border-radius: 12px;
  background: rgba(255,255,255,0.15);
  color: #fff;
  cursor: pointer;
  transition: 0.3s;
  font-size: 16px;
}
.icon-btn:hover {
  background: #fff;
  color: #2563eb;
}
.profile-card {
  max-width: 950px;
  margin: 30px auto;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0,0,0,0.08);
}
.profile-header {
  padding: 35px;
  text-align: center;
  background: #eff6ff;
  position: relative;
}
.edit-profile-link {
  position: absolute;
  top: 20px;
  right: 20px;
  border: none;
  background: ${isEditing ? '#dc2626' : '#2563eb'};
  color: #fff;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.3s;
  font-weight: 600;
}
.edit-profile-link:hover {
  background: ${isEditing ? '#b91c1c' : '#1d4ed8'};
}
.profile-avatar {
  width: 130px;
  height: 130px;
  margin: 0 auto 18px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  background: #e0e7ff;
  border: 4px solid #fff;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
}
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  color: #94a3b8;
}
.avatar-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(0,0,0,0.6);
  color: #fff;
  text-align: center;
  padding: 10px;
  cursor: pointer;
  opacity: 0;
  transition: 0.3s;
}
.profile-avatar:hover .avatar-overlay {
  opacity: 1;
}
.profile-header h3 {
  font-size: 28px;
  margin-bottom: 8px;
}
.user-type {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #dbeafe;
  color: #1e40af;
  padding: 10px 16px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
}
.form-section {
  padding: 30px;
  border-top: 1px solid #e2e8f0;
}
.form-section h4 {
  margin-bottom: 24px;
  font-size: 20px;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 10px;
}
.form-group {
  margin-bottom: 22px;
}
.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #334155;
}
input, textarea, select {
  width: 100%;
  padding: 14px;
  border: 1px solid ${isEditing ? '#cbd5e1' : '#e2e8f0'};
  border-radius: 14px;
  font-size: 15px;
  background: ${isEditing ? '#fff' : '#f8fafc'};
  transition: 0.3s;
  cursor: ${isEditing ? 'text' : 'default'};
}
input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}
textarea {
  min-height: 130px;
  resize: vertical;
}
.double-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.hint-text {
  margin-top: 8px;
  font-size: 13px;
  color: #64748b;
}
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  padding: 30px;
}
.btn-cancel, .btn-save {
  border: none;
  padding: 14px 28px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}
.btn-cancel {
  background: #e2e8f0;
  color: #334155;
}
.btn-cancel:hover {
  background: #cbd5e1;
}
.btn-save {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
}
.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
}
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
  z-index: 100;
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #64748b;
  cursor: pointer;
  transition: 0.3s;
  font-size: 13px;
}
.nav-item i {
  font-size: 18px;
}
.nav-item.active, .nav-item:hover {
  color: #2563eb;
}
.footer {
  background: #0f172a;
  color: #fff;
  margin-top: 60px;
  padding: 50px 20px 120px;
}
.footer-content {
  max-width: 1200px;
  margin: auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 30px;
}
.footer-col h4 {
  margin-bottom: 18px;
}
.footer-col p, .footer-col a {
  color: #cbd5e1;
  font-size: 14px;
  margin-bottom: 10px;
  display: block;
  text-decoration: none;
}
.footer-col a:hover {
  color: #fff;
}
.social-links {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
.social-links a {
  width: 38px;
  height: 38px;
  background: #1e293b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s;
}
.social-links a:hover {
  background: #2563eb;
}
.footer-bottom {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
  font-size: 13px;
  color: #94a3b8;
}
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal.active {
  display: flex;
}
.modal-content {
  background: #fff;
  padding: 30px;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}
.modal-content h4 {
  margin-bottom: 12px;
}
.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}
.success-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  color: #fff;
  padding: 16px 20px;
  border-radius: 14px;
  z-index: 9999;
  box-shadow: 0 10px 24px rgba(0,0,0,0.15);
  transition: 0.3s;
}
@media (max-width: 768px) {
  .double-row {
    grid-template-columns: 1fr;
  }
  .profile-header {
    padding-top: 70px;
  }
  .edit-profile-link {
    top: 16px;
    right: 16px;
  }
  .action-buttons {
    flex-direction: column;
  }
  .btn-cancel, .btn-save {
    width: 100%;
  }
  .footer {
    padding-bottom: 140px;
  }
} `;

  return (
    <>
      <style>{styles}</style>
      <div className="profile-container">
        <div className="user-header">
          <div className="user-info">
            <h2>Meu Perfil</h2>
            <p>Gerencie suas informações pessoais</p>
          </div>
          <div className="user-actions">
            <button
              className="icon-btn"
              onClick={() => navigate('/client/proposals')}
            >
              <i className="fas fa-bell"></i>
            </button>
            <button
              className="icon-btn"
              onClick={() => navigate('/client/home')}
            >
              <i className="fas fa-home"></i>
            </button>
            <button className="icon-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-header">
            <button 
              className="edit-profile-link" 
              onClick={() => isEditing ? cancelChanges() : setIsEditing(true)}
            >
              <i className="fas fa-pen"></i> {isEditing ? 'Cancelar' : 'Editar perfil'}
            </button>
            <div className="profile-avatar">
              {avatar ? (
                <img className="avatar-image" src={avatar} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  <i className="fas fa-user-circle"></i>
                </div>
              )}
              {isEditing && (
                <div className="avatar-overlay" onClick={openPhotoModal}>
                  <i className="fas fa-camera"></i>
                </div>
              )}
            </div>
            <h3>{displayName}</h3>
            <div className="user-type">
              <i className="fas fa-user-check"></i> <span>Cliente</span>
            </div>
          </div>

          <div className="form-section">
            <h4>
              <i className="fas fa-user-edit"></i> Informações Pessoais
            </h4>
            <div className="double-row">
              <div className="form-group">
                <label>Nome completo</label>
                <input
                  type="text"
                  id="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>Data de nascimento</label>
                <input
                  type="date"
                  id="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="double-row">
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="tel"
                  id="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>CPF</label>
                <input
                  type="text"
                  id="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Endereço</label>
              <input
                type="text"
                id="endereco"
                value={formData.endereco}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="double-row">
              <div className="form-group">
                <label>Cidade</label>
                <input
                  type="text"
                  id="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select
                  id="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <option value="">Selecione</option>
                  <option value="DF">DF</option>
                  <option value="SP">SP</option>
                  <option value="RJ">RJ</option>
                  <option value="MG">MG</option>
                  <option value="BA">BA</option>
                  <option value="PR">PR</option>
                  <option value="RS">RS</option>
                  <option value="SC">SC</option>
                  <option value="GO">GO</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>
              <i className="fas fa-address-card"></i> Sobre mim
            </h4>
            <div className="form-group">
              <label>Biografia</label>
              <textarea 
                id="bio" 
                value={formData.bio} 
                onChange={handleChange}
                disabled={!isEditing}
              />
              <div className="hint-text">
                Compartilhe suas preferências e o que você valoriza em um
                profissional
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>
              <i className="fas fa-cog"></i> Preferências
            </h4>
            <div className="double-row">
              <div className="form-group">
                <label>Receber notificações</label>
                <select
                  id="notificacoes"
                  value={formData.notificacoes}
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <option value="sim">Sim, quero receber</option>
                  <option value="nao">Não, não quero receber</option>
                </select>
              </div>
              <div className="form-group">
                <label>Idioma</label>
                <select
                  id="idioma"
                  value={formData.idioma}
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <option value="pt">Português</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="action-buttons">
              <button className="btn-cancel" onClick={cancelChanges}>
                Cancelar
              </button>
              <button className="btn-save" onClick={saveProfile}>
                Salvar alterações
              </button>
            </div>
          )}
        </div>

        <div className="footer"></div>

        <div
          className={`modal ${photoModalOpen ? 'active' : ''}`}
          onClick={closePhotoModal}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>
              <i className="fas fa-camera"></i> Adicionar foto de perfil
            </h4>
            <p>Escolha uma foto para seu perfil</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handlePhotoFileChange}
              style={{ margin: '1rem 0' }}
            />
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={closePhotoModal}>
                Cancelar
              </button>
              <button className="btn-save" onClick={saveProfilePhoto}>
                Salvar foto
              </button>
            </div>
          </div>
        </div>

        {toast.show && (
          <div
            className="success-toast"
            style={{ background: toast.isError ? '#dc2626' : '#2563eb' }}
          >
            <i
              className={`fas ${toast.isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}
            ></i>{' '}
            {toast.message}
          </div>
        )}
      </div>

      <link
        href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      />
    </>
  );
};

export default Profile;
