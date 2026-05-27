
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { listarMinhasPropostas } from '../../services/api';

const Services = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [servicos, setServicos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dados = await listarMinhasPropostas();
        if (dados.propostas) {
          setServicos(dados.propostas);
        }
      } catch (error) {
        console.error(error);
      }
    };
    carregarDados();
  }, []);

  const openServiceModal = (servico) => {
    setSelectedService(servico);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedService(null);
  };
  const handleUpdate = () => {
    showToast('🔄 Página atualizada!');
  };
  const handleCreateService = () => navigate('/client/post-service');
  const handleEdit = () => showToast('✏️ Edição em breve');

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f3f4f6; font-family: 'Inter', sans-serif; padding: 1.5rem; color: #1e293b; }
    .services-container { max-width: 1200px; margin: 0 auto; }
    .user-header { background: white; border-radius: 1.5rem; padding: 1.5rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .user-info h2 { font-size: 1.6rem; font-weight: 700; color: #111827; margin-bottom: 0.3rem; }
    .user-info p { color: #64748b; font-size: 0.95rem; }
    .user-actions { display: flex; gap: 0.8rem; }
    .icon-btn { background: #f1f5f9; border: none; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; font-size: 1rem; color: #475569; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
    .icon-btn:hover { background: #f97316; color: white; transform: translateY(-3px); box-shadow: 0 8px 18px rgba(249,115,22,0.25); }
    .main-grid { display: grid; grid-template-columns: 1fr 360px; gap: 1.5rem; }
    .section-card { background: white; border-radius: 1.5rem; padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 0.8rem; }
    .section-header h3 { font-size: 1.2rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 0.5rem; }
    .update-btn { border: none; background: #f97316; color: white; padding: 0.7rem 1rem; border-radius: 2rem; cursor: pointer; font-weight: 600; transition: 0.3s; display: flex; align-items: center; gap: 0.4rem; }
    .update-btn:hover { background: #ea580c; transform: translateY(-2px); }
    .progress-section { margin-bottom: 1.5rem; }
    .progress-label { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem; color: #475569; font-weight: 600; }
    .progress-bar { background: #e2e8f0; border-radius: 2rem; height: 10px; overflow: hidden; }
    .progress-fill { background: linear-gradient(90deg, #f97316, #fb923c); height: 100%; border-radius: 2rem; }
    .status-badge { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.35rem 0.7rem; border-radius: 2rem; font-size: 0.75rem; font-weight: 700; }
    .status-waiting { background: #fef3c7; color: #d97706; }
    .service-card { background: white; border-radius: 1.2rem; padding: 1rem; margin-bottom: 1rem; border: 1px solid #e2e8f0; cursor: pointer; transition: 0.3s; }
    .service-card:hover { border-color: #f97316; transform: translateX(6px); box-shadow: 0 10px 20px rgba(0,0,0,0.06); }
    .service-title { font-weight: 600; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.8rem; color: #0f172a; }
    .service-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; font-size: 0.9rem; color: #64748b; padding-top: 0.8rem; border-top: 1px solid #f1f5f9; }
    .interested-count { font-weight: 600; color: #f97316; }
    .create-btn { width: 100%; background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 1rem; border: none; border-radius: 3rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 1rem; font-size: 1rem; transition: 0.3s; }
    .create-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 20px rgba(249,115,22,0.25); }
    .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: none; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal.active { display: flex; }
    .modal-content { background: white; border-radius: 1.5rem; max-width: 500px; width: 100%; max-height: 85vh; overflow: auto; animation: modalFade 0.3s ease; }
    .modal-header { background: #f97316; color: white; padding: 1.2rem; display: flex; justify-content: space-between; align-items: center; }
    .close-modal { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; }
    .modal-body { padding: 1.5rem; color: #334155; line-height: 1.7; }
    .success-toast { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); background: #f97316; color: white; padding: 0.9rem 1.8rem; border-radius: 3rem; z-index: 1000; font-weight: 600; box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
    @media (max-width: 768px) { .main-grid { grid-template-columns: 1fr; } .user-header { flex-direction: column; align-items: flex-start; } }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="services-container">
        <div className="user-header">
          <div className="user-info">
            <h2>Olá, João</h2>
            <p>Acompanhe seus pedidos</p>
          </div>
          <div className="user-actions">
            <button className="icon-btn" onClick={() => navigate('/client/home')}>
              <i className="fas fa-home"></i>
            </button>
            <button
              className="icon-btn"
              onClick={() => {
                showToast('👋 Logout');
                setTimeout(() => navigate('/'), 1500);
              }}
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
        <div className="main-grid">
          <div className="left-column">
            <div className="section-card">
              <div className="section-header">
                <h3>
                  <i className="fas fa-clipboard-list"></i> Pedidos Abertos
                </h3>
                <button className="update-btn" onClick={handleUpdate}>
                  <i className="fas fa-sync-alt"></i> Atualizar
                </button>
              </div>
              <div className="progress-section">
                <div className="progress-label">
                  <span>Ativos</span>
                  <span>{servicos.length}-Pedidos</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((servicos.length / 3) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              {servicos.map((servico) => (
                <div
                  key={servico.id}
                  className="service-card"
                  onClick={() => openServiceModal(servico)}
                >
                  <div className="service-title">
                    <span>{servico.titulo}</span>
                    <span className="status-badge status-waiting">
                      <i className="fas fa-clock"></i> Aguardando
                    </span>
                  </div>
                  <div className="service-footer">
                    <span>
                      <i className="fas fa-users"></i>{' '}
                      <span className="interested-count">0 interessados</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="right-column">
            <div className="section-card">
              <div className="section-header">
                <h3>
                  <i className="fas fa-chart-line"></i> Status
                </h3>
              </div>
              <div className="status-list">
                {servicos.map((servico) => (
                  <div
                    key={servico.id}
                    className="status-item"
                    onClick={() => openServiceModal(servico)}
                  >
                    <div>
                      <strong>{servico.titulo}</strong>
                    </div>
                    <div>
                      <span>Aguardando profissionais</span>{' '}
                      <span className="interested-count"> 0 interessados</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="create-btn" onClick={handleCreateService}>
              <i className="fas fa-plus-circle"></i> + Criar Novo Pedido
            </button>
          </div>
        </div>
        {/* Modal */}
        <div
          className={`modal ${modalOpen ? 'active' : ''}`}
          onClick={closeModal}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalhes do Serviço</h3>
              <button className="close-modal" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {selectedService && (
                <>
                  <div>
                    <strong>{selectedService.titulo}</strong>
                  </div>
                  <div>{selectedService.descricao}</div>
                  <div>Status: {selectedService.status}</div>
                  <div>Valor sugerido: R$ {selectedService.preco}</div>
                  <div>Localização: {selectedService.localizacao}</div>
                  <button className="create-btn" onClick={handleEdit}>
                    Editar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {toastMessage && <div className="success-toast">{toastMessage}</div>}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      />
    </>
  );
};

export default Services;

