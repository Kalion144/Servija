import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ServiceDetails = () => {
  // Hooks
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  // State
  const [servico, setServico] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // Effects
  useEffect(() => {
    if (location.state?.servico) {
      const servicoData = location.state.servico;
      if (servicoData.fotos && typeof servicoData.fotos === 'string') {
        try {
          servicoData.fotos = JSON.parse(servicoData.fotos);
        } catch (e) {
          servicoData.fotos = [];
        }
      }
      setServico(servicoData);
    }
  }, [id, location]);

  // Functions
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const openModal = (title: string, msg: string) => {
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

  // Loading state
  if (!servico) return <div className="container">Carregando...</div>;

  // Styles
  const styles = `
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
      font-family: 'Inter', sans-serif; 
    }
    
    body { 
      background: #fff7ed; 
      min-height: 100vh;
    }
    
    .container { 
      max-width: 1100px; 
      margin: 0 auto; 
      padding: 32px 20px 48px; 
    }
    
    .top-bar { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      flex-wrap: wrap; 
      gap: 16px;
      margin-bottom: 32px; 
      background: white; 
      padding: 16px 32px; 
      border-radius: 80px; 
      box-shadow: 0 2px 12px rgba(0,0,0,0.05); 
      border: 1px solid #fed7aa; 
    }
    
    .page-title { 
      font-weight: 800; 
      font-size: 1.6rem; 
      color: #7c2d12; 
      display: flex; 
      align-items: center; 
      gap: 10px; 
    }
    
    .back-home { 
      background: #fff7ed; 
      padding: 10px 22px; 
      border-radius: 60px; 
      text-decoration: none; 
      color: #c2410c; 
      font-weight: 600; 
      font-size: 0.9rem; 
      transition: all 0.2s; 
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      gap: 6px; 
    }
    
    .back-home:hover { 
      background: #fed7aa; 
      transform: translateY(-1px); 
    }
    
    .service-detail-grid { 
      display: flex; 
      flex-wrap: wrap; 
      gap: 32px; 
      margin-bottom: 40px; 
    }
    
    .image-column { 
      flex: 1; 
      min-width: 280px; 
    }
    
    .service-image { 
      background: #fff7ed; 
      border-radius: 36px; 
      overflow: hidden; 
      box-shadow: 0 12px 24px -12px rgba(0,0,0,0.15); 
      border: 1px solid #fed7aa; 
    }
    
    .service-image img { 
      width: 100%; 
      height: auto; 
      display: block; 
      object-fit: cover; 
    }
    
    .service-image-placeholder { 
      background: #fff7ed; 
      border-radius: 36px; 
      padding: 80px 20px; 
      text-align: center; 
      color: #c2410c; 
    }
    
    .info-column { 
      flex: 1; 
      min-width: 280px; 
    }
    
    .service-title { 
      font-size: 2rem; 
      font-weight: 800; 
      color: #7c2d12; 
      line-height: 1.25; 
      margin-bottom: 20px; 
    }
    
    .description-service { 
      background: #fffbeb; 
      padding: 24px; 
      border-radius: 28px; 
      margin: 20px 0; 
      color: #431407; 
      line-height: 1.6; 
      border: 1px solid #fed7aa; 
    }
    
    .description-service strong { 
      display: block; 
      margin-bottom: 10px; 
      color: #7c2d12; 
      font-size: 1.1rem; 
    }
    
    .quick-info { 
      background: white; 
      border-radius: 28px; 
      border: 1px solid #ffe4c2; 
      padding: 24px 28px; 
      margin: 24px 0; 
    }
    
    .quick-info h3 { 
      font-size: 1.4rem; 
      margin-bottom: 20px; 
      color: #7c2d12; 
      display: flex; 
      align-items: center; 
      gap: 10px; 
    }
    
    .info-row { 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      padding: 14px 0; 
      border-bottom: 1px dashed #ffe4c2; 
      flex-wrap: wrap;
    }
    
    .info-row:last-child { 
      border-bottom: none; 
    }
    
    .info-row span:first-child { 
      font-weight: 600; 
      color: #7c2d12; 
      min-width: 130px; 
    }
    
    .info-row span:last-child { 
      color: #431407; 
    }
    
    .action-buttons { 
      display: flex; 
      gap: 16px; 
      flex-wrap: wrap; 
      margin-top: 24px; 
    }
    
    .btn-interest, .btn-proposal { 
      padding: 14px 32px; 
      border-radius: 60px; 
      font-weight: 700; 
      font-size: 1rem; 
      border: none; 
      cursor: pointer; 
      transition: all 0.2s; 
      display: flex; 
      align-items: center; 
      gap: 8px; 
    }
    
    .btn-interest { 
      background: #ffedd5; 
      color: #9a3412; 
    }
    
    .btn-proposal { 
      background: linear-gradient(135deg, #f97316, #ea580c); 
      color: white; 
      box-shadow: 0 4px 12px rgba(249,115,22,0.25); 
    }
    
    .btn-interest:hover { 
      transform: translateY(-1px); 
    }
    
    .btn-proposal:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 8px 18px rgba(249,115,22,0.35); 
    }
    
    .modal-overlay { 
      position: fixed; 
      top: 0; 
      left: 0; 
      width: 100%; 
      height: 100%; 
      background: rgba(0,0,0,0.6); 
      backdrop-filter: blur(5px); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      z-index: 1000; 
      visibility: hidden; 
      opacity: 0; 
      transition: all 0.2s; 
    }
    
    .modal-overlay.active { 
      visibility: visible; 
      opacity: 1; 
    }
    
    .modal-card { 
      background: white; 
      max-width: 420px; 
      width: 90%; 
      border-radius: 40px; 
      padding: 36px; 
      text-align: center; 
      box-shadow: 0 20px 35px rgba(0,0,0,0.2); 
    }
    
    .modal-card h3 { 
      color: #7c2d12; 
      margin-bottom: 12px; 
      font-size: 1.5rem; 
    }
    
    .modal-card p { 
      color: #431407; 
      margin-bottom: 20px; 
    }
    
    .modal-card button { 
      background: linear-gradient(135deg, #f97316, #ea580c); 
      border: none; 
      padding: 12px 32px; 
      border-radius: 60px; 
      color: white; 
      font-weight: 700; 
      margin-top: 8px; 
      cursor: pointer; 
      transition: all 0.2s; 
    }
    
    .modal-card button:hover { 
      transform: translateY(-1px); 
    }
    
    .toast-message { 
      position: fixed; 
      bottom: 30px; 
      left: 50%; 
      transform: translateX(-50%); 
      background: rgba(124, 45, 18, 0.95); 
      color: white; 
      padding: 14px 30px; 
      border-radius: 60px; 
      font-weight: 600; 
      z-index: 1100; 
      font-size: 0.9rem; 
      backdrop-filter: blur(4px); 
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
    }
    
    /* Responsive Styles */
    @media (max-width: 900px) {
      .container {
        padding: 24px 16px 40px;
      }
      
      .page-title {
        font-size: 1.4rem;
      }
      
      .service-title {
        font-size: 1.7rem;
      }
    }
    
    @media (max-width: 700px) {
      .top-bar { 
        padding: 16px 20px; 
        justify-content: center;
        text-align: center;
      }
      
      .page-title {
        width: 100%;
        justify-content: center;
      }
      
      .service-detail-grid {
        gap: 24px;
      }
      
      .action-buttons {
        flex-direction: column;
      }
      
      .btn-interest, .btn-proposal {
        width: 100%;
        justify-content: center;
      }
      
      .info-row span:first-child {
        min-width: auto;
      }
    }
    
    @media (max-width: 400px) {
      .top-bar {
        border-radius: 30px;
        padding: 14px 16px;
      }
      
      .page-title {
        font-size: 1.25rem;
      }
      
      .service-title {
        font-size: 1.5rem;
      }
      
      .quick-info h3 {
        font-size: 1.2rem;
      }
      
      .modal-card {
        padding: 28px 20px;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="container">
        <div className="top-bar">
          <div className="page-title">
            <i className="fas fa-tools"></i> Detalhes do Serviço
          </div>
          <button
            className="back-home"
            onClick={() => navigate('/professional/home')}
          >
            <i className="fas fa-arrow-left"></i> Voltar para Home
          </button>
        </div>

        <div className="service-detail-grid">
          <div className="image-column">
            {servico.fotos && servico.fotos.length > 0 ? (
              <div className="service-image">
                <img
                  src={`http://localhost:3000${servico.fotos[0]}`}
                  alt={servico.titulo}
                />
              </div>
            ) : (
              <div className="service-image-placeholder">
                <i
                  className="fas fa-image"
                  style={{ fontSize: '100px', marginBottom: '20px' }}
                ></i>
                <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>
                  Nenhuma foto enviada
                </p>
              </div>
            )}
          </div>
          <div className="info-column">
            <h1 className="service-title">{servico.titulo}</h1>
            <div className="description-service">
              <strong>📝 Descrição do Serviço</strong>
              <p>{servico.descricao}</p>
            </div>
            <div className="quick-info">
              <h3>📍 Informações Rápidas</h3>
              <div className="info-row">
                <span>📍 Localização</span>
                <span>{servico.localizacao}</span>
              </div>
              <div className="info-row">
                <span>💰 Valor</span>
                <span>
                  {servico.preco
                    ? `R$ ${Number(servico.preco).toFixed(2)}`
                    : 'A negociar'}
                </span>
              </div>
              <div className="info-row">
                <span>⏰ Urgência</span>
                <span>
                  {servico.urgente === 1 ? '🔴 Sim, urgente!' : 'Não'}
                </span>
              </div>
              <div className="info-row">
                <span>📞 Contato</span>
                <span>{servico.contato}</span>
              </div>
            </div>
            <div className="action-buttons">
              <button className="btn-interest" onClick={handleInterest}>
                <i className="fas fa-heart"></i> Tenho Interesse
              </button>
              <button className="btn-proposal" onClick={handleProposal}>
                <i className="fas fa-paper-plane"></i> Enviar Proposta
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

      {toastMessage && <div className="toast-message">{toastMessage}</div>}
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

export default ServiceDetails;
