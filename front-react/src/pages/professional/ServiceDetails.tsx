
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ServiceDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [servico, setServico] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    if (location.state?.servico) {
      setServico(location.state.servico);
    }
  }, [id, location]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };
  const openModal = (title, msg) => {
    setModalTitle(title);
    setModalMessage(msg);
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);
  const handleInterest = () =>
    openModal(
      'Interesse registrado',
      `Você manifestou interesse no serviço "${servico?.titulo}". O cliente será notificado.`
    );
  const handleProposal = () =>
    navigate('/professional/send-proposal', { state: { servico } });

  if (!servico) return <div className="container">Carregando...</div>;

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f4f7fd; font-family: 'Inter', sans-serif; padding: 0; color: #1e2e3e; }
    .container { max-width: 1100px; margin: 0 auto; padding: 24px 20px 48px; }
    .top-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; margin-bottom: 28px; background: white; padding: 12px 24px; border-radius: 80px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); border: 1px solid #eef2f8; }
    .logo { font-weight: 800; font-size: 1.5rem; background: linear-gradient(125deg, #1F3B4C, #2C7A6E); background-clip: text; -webkit-background-clip: text; color: transparent; }
    .back-home { background: #eef2fa; padding: 8px 18px; border-radius: 40px; text-decoration: none; color: #2c5a6e; font-weight: 600; font-size: 0.85rem; transition: 0.2s; cursor: pointer; }
    .service-detail-grid { display: flex; flex-wrap: wrap; gap: 32px; margin-bottom: 40px; }
    .image-column { flex: 1; min-width: 260px; }
    .service-image { background: #eef2f8; border-radius: 36px; overflow: hidden; box-shadow: 0 12px 24px -12px rgba(0,0,0,0.15); border: 1px solid #eef2fa; }
    .service-image img { width: 100%; height: auto; display: block; object-fit: cover; }
    .service-image-placeholder { background: #f5f7fa; border-radius: 36px; padding: 60px 20px; text-align: center; color: #8ba0bc; }
    .info-column { flex: 1; min-width: 280px; }
    .service-title { font-size: 1.8rem; font-weight: 800; color: #1f3b4c; line-height: 1.25; margin-bottom: 16px; }
    .description-service { background: #f9fbfe; padding: 20px; border-radius: 28px; margin: 18px 0; color: #2d4a62; line-height: 1.5; border: 1px solid #edf2f8; }
    .quick-info { background: #ffffff; border-radius: 28px; border: 1px solid #e9f0f5; padding: 20px 24px; margin: 20px 0; }
    .quick-info h3 { font-size: 1.3rem; margin-bottom: 16px; color: #1f3b4c; display: flex; align-items: center; gap: 8px; }
    .info-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f0f4fa; }
    .action-buttons { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 20px; }
    .btn-interest, .btn-proposal { padding: 12px 28px; border-radius: 48px; font-weight: 700; font-size: 0.9rem; border: none; cursor: pointer; transition: all 0.2s; }
    .btn-interest { background: #f0a500; color: #2c2b26; }
    .btn-proposal { background: #1f3b4c; color: white; }
    .btn-interest:hover, .btn-proposal:hover { transform: scale(0.97); }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000; visibility: hidden; opacity: 0; transition: 0.2s; }
    .modal-overlay.active { visibility: visible; opacity: 1; }
    .modal-card { background: white; max-width: 400px; width: 90%; border-radius: 44px; padding: 32px; text-align: center; box-shadow: 0 20px 35px rgba(0,0,0,0.2); }
    .modal-card button { background: #1f3b4c; border: none; padding: 12px 28px; border-radius: 60px; color: white; font-weight: 700; margin-top: 20px; cursor: pointer; }
    .toast-msg { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #1f2e3a; color: white; padding: 10px 24px; border-radius: 60px; font-weight: 500; z-index: 1100; font-size: 0.85rem; }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="container">
        <div className="top-bar">
          <div className="logo">Detalhe do Serviço</div>
          <button className="back-home" onClick={() => navigate('/professional/home')}>
            ← Voltar para Home
          </button>
        </div>
        <div className="service-detail-grid">
          <div className="image-column">
            {servico.fotos && servico.fotos.length > 0 ? (
              <div className="service-image">
                <img src={servico.fotos[0]} alt={servico.titulo} />
              </div>
            ) : (
              <div className="service-image-placeholder">
                <i
                  className="fas fa-image"
                  style={{ fontSize: '80px', marginBottom: '16px' }}
                ></i>
                <p>Nenhuma imagem enviada</p>
              </div>
            )}
          </div>
          <div className="info-column">
            <h1 className="service-title">{servico.titulo}</h1>
            <div className="description-service">
              <strong>Descrição</strong>
              <p>{servico.descricao}</p>
            </div>
            <div className="quick-info">
              <h3>Informações</h3>
              <div className="info-row">
                <span>📍 Localização</span>
                <span>{servico.localizacao}</span>
              </div>
              <div className="info-row">
                <span>💰 Valor</span>
                <span>R$ {servico.preco}</span>
              </div>
              <div className="info-row">
                <span>⏰ Urgência</span>
                <span>{servico.urgente ? 'Sim' : 'Não'}</span>
              </div>
              <div className="info-row">
                <span>📞 Contato</span>
                <span>{servico.contato}</span>
              </div>
            </div>
            <div className="action-buttons">
              <button className="btn-interest" onClick={handleInterest}>
                Tenho interesse
              </button>
              <button className="btn-proposal" onClick={handleProposal}>
                Fazer proposta
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`modal-overlay ${modalVisible ? 'active' : ''}`}
        onClick={closeModal}
      >
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <h3>{modalTitle}</h3>
          <p>{modalMessage}</p>
          <button onClick={closeModal}>Fechar</button>
        </div>
      </div>
      {toastMessage && <div className="toast-msg">{toastMessage}</div>}
    </>
  );
};

export default ServiceDetails;

