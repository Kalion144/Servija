import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  checkFavoriteUser,
  toggleFavoriteUser,
  iniciarConversa,
  obterServicoPorId,
} from '../../services/api';
import { URGENCIA_OPCOES, TIPO_ATENDIMENTO } from '../../lib/serviceOptions';

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
  const [isClientFavorite, setIsClientFavorite] = useState(false);
  const [iniciandoChat, setIniciandoChat] = useState(false);

  const parseServico = (servicoData: Record<string, unknown>) => {
    if (servicoData.fotos && typeof servicoData.fotos === 'string') {
      try {
        servicoData.fotos = JSON.parse(servicoData.fotos);
      } catch {
        servicoData.fotos = [];
      }
    }
    return servicoData;
  };

  // Effects
  useEffect(() => {
    const carregar = async () => {
      let servicoData = location.state?.servico;
      if (!servicoData && id) {
        try {
          const data = await obterServicoPorId(id);
          servicoData = data.servico;
        } catch (e) {
          console.error(e);
        }
      }
      if (servicoData) {
        const parsed = parseServico(servicoData);
        setServico(parsed);
        const clienteId = (parsed.cliente_id || parsed.client_id) as number | undefined;
        if (clienteId) {
          checkFavoriteUser(clienteId, true)
            .then((res) => setIsClientFavorite(res.isFavorite))
            .catch(console.error);
        }
      }
    };
    carregar();
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

  const clienteId = servico?.cliente_id ?? servico?.client_id;

  const handleToggleFavoriteClient = async () => {
    if (!clienteId) return;
    try {
      const res = await toggleFavoriteUser(clienteId, true);
      setIsClientFavorite(res.isFavorite);
      showToast(res.isFavorite ? 'Cliente favoritado! ❤️' : 'Cliente removido dos favoritos.');
    } catch (error) {
      console.error(error);
      showToast('Erro ao atualizar favorito');
    }
  };

  const handleConversar = async () => {
    if (!servico?.id || iniciandoChat) return;
    setIniciandoChat(true);
    try {
      const result = await iniciarConversa(servico.id);
      const conversaId = result.conversa?.id;
      if (conversaId) {
        navigate(`/professional/messages?id=${conversaId}`);
      } else {
        showToast('Erro ao iniciar conversa');
      }
    } catch (error) {
      console.error(error);
      showToast(
        error instanceof Error ? error.message : 'Erro ao iniciar conversa',
      );
    } finally {
      setIniciandoChat(false);
    }
  };

  const urgenciaLabel =
    URGENCIA_OPCOES.find((u) => u.value === servico?.urgencia_nivel)?.label ||
    (servico?.urgente === 1 ? 'Urgente' : 'Normal');

  const atendimentoLabel =
    TIPO_ATENDIMENTO.find((t) => t.value === servico?.tipo_atendimento)
      ?.label || servico?.tipo_atendimento;

  const formatOrcamento = () => {
    if (servico?.valor_minimo || servico?.valor_maximo) {
      const min = servico.valor_minimo
        ? `R$ ${Number(servico.valor_minimo).toFixed(2)}`
        : '';
      const max = servico.valor_maximo
        ? `R$ ${Number(servico.valor_maximo).toFixed(2)}`
        : '';
      if (min && max) return `${min} – ${max}`;
      return min || max;
    }
    if (servico?.preco) return `R$ ${Number(servico.preco).toFixed(2)}`;
    return 'A negociar';
  };

  // Loading state
  if (!servico) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', color: '#c2410c' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
        <p>Carregando serviço...</p>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </div>
    );
  }

  // Styles
  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
    .prof-detail-page { min-height: 100vh; background: #fff7ed; color: #1f2937; }
    .prof-detail-loading {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 60vh; gap: 16px; color: #c2410c; font-size: 1.1rem;
    }
    .user-header {
      width: 100%; background: white; padding: 20px 40px;
      display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 100;
      flex-wrap: wrap; gap: 16px; border-bottom: 1px solid #fed7aa;
    }
    .user-info { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .user-info h2 { font-size: 1.25rem; color: #7c2d12; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    .user-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .icon-btn {
      width: 45px; height: 45px; border: none; border-radius: 12px;
      background: #fff7ed; color: #f97316; display: inline-flex; align-items: center;
      justify-content: center; font-size: 18px; transition: 0.2s; cursor: pointer;
    }
    .icon-btn:hover { background: #f97316; color: white; transform: translateY(-2px); }
    .back-btn {
      background: #fff7ed; padding: 10px 20px; border-radius: 40px; border: none;
      color: #c2410c; font-weight: 600; font-size: 0.9rem; cursor: pointer;
      display: flex; align-items: center; gap: 8px; transition: 0.2s;
    }
    .back-btn:hover { background: #fed7aa; }
    .container { max-width: 1100px; margin: 0 auto; padding: 32px 40px 48px; }
    
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
    
    @media (max-width: 900px) {
      .container { padding: 24px 20px 40px; }
      .user-header { padding: 16px 20px; }
    }
    @media (max-width: 700px) {
      .service-detail-grid { gap: 24px; }
      .action-buttons { flex-direction: column; }
      .btn-interest, .btn-proposal { width: 100%; justify-content: center; }
      .info-row span:first-child { min-width: auto; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="prof-detail-page">
        <div className="user-header">
          <div className="user-info">
            <button className="back-btn" onClick={() => navigate('/professional/home')}>
              <i className="fas fa-arrow-left"></i> Voltar
            </button>
            <h2><i className="fas fa-tools"></i> Detalhes do Serviço</h2>
          </div>
          <div className="user-actions">
            <button className="icon-btn" onClick={() => navigate('/professional/messages')} title="Mensagens">
              <i className="fas fa-comments"></i>
            </button>
            <button className="icon-btn" onClick={() => navigate('/professional/profile')} title="Perfil">
              <i className="fas fa-user"></i>
            </button>
          </div>
        </div>

        <div className="container">
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
                <span>👤 Cliente</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {servico.cliente_nome}
                  {clienteId && (
                    <button 
                      onClick={handleToggleFavoriteClient}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '1.2rem', color: isClientFavorite ? '#ef4444' : '#cbd5e1'
                      }}
                      title="Favoritar Cliente"
                    >
                      <i className={isClientFavorite ? "fas fa-heart" : "far fa-heart"}></i>
                    </button>
                  )}
                </span>
              </div>
              <div className="info-row">
                <span>📍 Localização</span>
                <span>{servico.localizacao}</span>
              </div>
              <div className="info-row">
                <span>🏷️ Categoria</span>
                <span>
                  {servico.categoria}
                  {servico.subcategoria ? ` / ${servico.subcategoria}` : ''}
                </span>
              </div>
              <div className="info-row">
                <span>💰 Orçamento</span>
                <span>{formatOrcamento()}</span>
              </div>
              <div className="info-row">
                <span>⏰ Prazo</span>
                <span>{urgenciaLabel}</span>
              </div>
              {atendimentoLabel && (
                <div className="info-row">
                  <span>🖥️ Atendimento</span>
                  <span>{atendimentoLabel}</span>
                </div>
              )}
              <div className="info-row">
                <span>📞 Contato</span>
                <span>{servico.contato || servico.whatsapp || servico.telefone}</span>
              </div>
            </div>
            <div className="action-buttons">
              <button className="btn-interest" onClick={handleInterest}>
                <i className="fas fa-hand-paper"></i> Tenho Interesse
              </button>
              <button
                className="btn-proposal"
                onClick={handleConversar}
                disabled={iniciandoChat}
              >
                <i className="fas fa-comments"></i>{' '}
                {iniciandoChat ? 'Abrindo chat...' : 'Iniciar conversa'}
              </button>
            </div>
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
