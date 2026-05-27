import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { listarProfissionais } from '../../services/api';

const Home = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [prestadores, setPrestadores] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    isError: false,
  });
  const toastTimeoutRef = useRef(null);

  const showToast = (message, isError = false) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, message, isError });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ visible: false, message: '', isError: false });
    }, 3000);
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dados = await listarProfissionais();
        if (dados.profissionais) {
          setPrestadores(dados.profissionais);
        } else if (Array.isArray(dados)) {
          setPrestadores(dados);
        }
      } catch (error) {
        console.error(error);
      }
    };
    carregarDados();
  }, []);

  const clienteNome = usuario?.nome || 'Cliente';
  const clienteLocal = 'Brasília - DF';

  const openModal = (id) => {
    const prof = prestadores.find((p) => p.id === id);
    setSelectedProfessional(prof);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProfessional(null);
  };

  const handleAnnouncement = () => showToast('🏪 Ofertas abertas!');
  const handleCleaning = () => showToast('🧹 Agendamento em breve!');
  const handleContact = () => {
    showToast('📞 Contato enviado com sucesso!');
    closeModal();
  };
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
    body { background: #f3f4f6; color: #111827; }
    .home-container { width: 100%; min-height: 100vh; }
    .user-header { width: 100%; background: white; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 100; }
    .user-info h2 { font-size: 24px; margin-bottom: 5px; }
    .user-location { color: #6b7280; font-size: 14px; }
    .user-actions { display: flex; gap: 12px; }
    .icon-btn { width: 45px; height: 45px; border: none; border-radius: 12px; background: #f3f4f6; color: #374151; display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 18px; transition: 0.3s; cursor: pointer; }
    .icon-btn:hover { background: #f97316; color: white; transform: translateY(-2px); }
    .main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 25px; padding: 30px; }
    .professionals-section h3, .announcement-section h3 { margin-bottom: 20px; font-size: 22px; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
    .professional-card { background: white; padding: 20px; border-radius: 18px; cursor: pointer; transition: 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .professional-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .prof-name { font-weight: 700; font-size: 18px; }
    .rating { color: #f59e0b; font-weight: 600; }
    .service-title { font-weight: 700; margin-bottom: 10px; color: #f97316; }
    .service-description { color: #6b7280; margin-bottom: 15px; }
    .service-meta { display: flex; justify-content: space-between; font-size: 14px; color: #4b5563; }
    .price { font-weight: 700; color: #10b981; }
    .announcement-card { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 25px; border-radius: 20px; margin-bottom: 20px; }
    .announcement-card h4 { margin-bottom: 15px; font-size: 22px; }
    .announcement-card p { margin-bottom: 10px; }
    .announcement-btn { margin-top: 15px; border: none; background: white; color: #f97316; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
    .announcement-btn:hover { transform: scale(1.03); }
    .footer { background: #111827; color: white; margin-top: 40px; padding-top: 50px; }
    .footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 30px; padding: 0 40px 40px; }
    .footer-col h4 { margin-bottom: 20px; color: #f97316; }
    .footer-col p, .footer-col a { color: #d1d5db; margin-bottom: 10px; display: block; text-decoration: none; }
    .footer-col a:hover { color: white; }
    .social-links { display: flex; gap: 12px; margin-top: 15px; }
    .social-links a { width: 38px; height: 38px; border-radius: 10px; background: #1f2937; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
    .social-links a:hover { background: #f97316; }
    .footer-bottom { border-top: 1px solid #374151; padding: 20px; text-align: center; color: #9ca3af; }
    .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; visibility: hidden; opacity: 0; transition: visibility 0.2s, opacity 0.2s; }
    .modal.active { visibility: visible; opacity: 1; }
    .modal-content { width: 90%; max-width: 600px; background: white; border-radius: 20px; overflow: hidden; animation: fade 0.3s ease; }
    @keyframes fade { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-header { padding: 20px; background: #f97316; color: white; display: flex; justify-content: space-between; align-items: center; }
    .close-modal { background: none; border: none; color: white; font-size: 28px; cursor: pointer; }
    .modal-body { padding: 25px; }
    .modal-prof-name { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
    .modal-rating { color: #f59e0b; margin-bottom: 20px; }
    .modal-info p { margin-bottom: 12px; color: #374151; }
    .contact-btn { width: 100%; margin-top: 20px; padding: 15px; border: none; border-radius: 14px; background: #f97316; color: white; font-size: 16px; font-weight: 700; cursor: pointer; transition: 0.3s; }
    .contact-btn:hover { background: #ea580c; }
    .success-toast { position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 12px; color: white; font-weight: 600; z-index: 9999; transition: 0.3s; }
    @media (max-width: 900px) { .main-grid { grid-template-columns: 1fr; } .user-header { padding: 20px; flex-direction: column; gap: 20px; align-items: flex-start; } }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="home-container">
        <div className="user-header">
          <div className="user-info">
            <h2>Olá, {clienteNome.split(' ')[0]}</h2>
            <div className="user-location">
              <i className="fas fa-map-marker-alt"></i> {clienteLocal}
            </div>
          </div>
          <div className="user-actions">
            <button
              className="icon-btn"
              onClick={() => navigate('/client/proposals')}
              title="Notificações"
            >
              <i className="fas fa-bell"></i>
            </button>
            <button
              className="icon-btn"
              onClick={() => navigate('/client/post-service')}
              title="Publicar Serviço"
            >
              <i className="fas fa-plus-circle"></i>
            </button>
            <button
              className="icon-btn"
              onClick={() => navigate('/client/services')}
              title="Serviços Recebidos"
            >
              <i className="fas fa-briefcase"></i>
            </button>
            <button
              className="icon-btn"
              onClick={() => navigate('/client/profile')}
              title="Perfil"
            >
              <i className="fas fa-user"></i>
            </button>
            <button
              className="icon-btn"
              onClick={() => navigate('/client/home')}
              title="Home"
            >
              <i className="fas fa-home"></i>
            </button>
            <button
              className="icon-btn"
              onClick={() => navigate('/')}
              title="Sair"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
        <div className="main-grid">
          <div className="professionals-section">
            <h3>
              <i className="fas fa-users"></i> Profissionais próximos a você
            </h3>
            <div className="cards-grid">
              {prestadores.map((prof) => (
                <div
                  key={prof.id}
                  className="professional-card"
                  onClick={() => openModal(prof.id)}
                >
                  <div className="card-header">
                    <span className="prof-name">{prof.nome}</span>
                    <div className="rating">
                      <i className="fas fa-star"></i> {prof.avaliacao || 'Novo'}
                    </div>
                  </div>
                  <div className="service-title">{prof.profissao}</div>
                  <div className="service-description">
                    {prof.bio
                      ? prof.bio.substring(0, 60)
                      : 'Profissional disponível para serviços.'}
                  </div>
                  <div className="service-meta">
                    <span>
                      <i className="fas fa-map-marker-alt"></i>{' '}
                      {prof.localizacao || 'Local não informado'}
                    </span>
                    <span className="price">💰 Sob consulta</span>
                  </div>
                </div>
              ))}
              {prestadores.length === 0 && (
                <div
                  className="professional-card"
                  style={{ textAlign: 'center' }}
                >
                  <p>Nenhum profissional cadastrado ainda.</p>
                  <p style={{ fontSize: '0.8rem' }}>
                    Peça para um prestador se cadastrar no perfil.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="announcement-section">
            <h3>
              <i className="fas fa-tag"></i> Destaques
            </h3>
            <div className="announcement-card">
              <h4>
                <i className="fas fa-hard-hat"></i> Material de Construção
              </h4>
              <p>Promoções em ferramentas</p>
              <p>Aproveite as ofertas da semana!</p>
              <button className="announcement-btn" onClick={handleAnnouncement}>
                Ver ofertas →
              </button>
            </div>
            <div
              className="announcement-card"
              style={{
                background: 'linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)',
              }}
            >
              <h4>
                <i className="fas fa-broom"></i> Limpeza e Conservação
              </h4>
              <p>Desconto especial para novos clientes</p>
              <p>Agende já sua diarista</p>
              <button className="announcement-btn" onClick={handleCleaning}>
                Agendar →
              </button>
            </div>
          </div>
        </div>
        <div className="footer">
          <div className="footer-content">
            <div className="footer-col">
              <h4>Servijá</h4>
              <p>
                Conectando pessoas a prestadores de serviços de forma rápida,
                prática e segura.
              </p>
              <div className="social-links">
                <a href="#">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#">
                  <i className="fab fa-whatsapp"></i>
                </a>
                <a href="#">
                  <i className="fab fa-twitter"></i>
                </a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Para clientes</h4>
              <a href="#">Como funciona</a>
              <a href="#">Profissionais disponíveis</a>
              <a href="#">Avaliações</a>
              <a href="#">Dúvidas frequentes</a>
            </div>
            <div className="footer-col">
              <h4>Para profissionais</h4>
              <a href="#">Cadastre-se</a>
              <a href="#">Planos e preços</a>
              <a href="#">Central do profissional</a>
              <a href="#">Depoimentos</a>
            </div>
            <div className="footer-col">
              <h4>Contato</h4>
              <p>
                <i className="fas fa-phone"></i> (61) 99999-9999
              </p>
              <p>
                <i className="fas fa-envelope"></i> contato@servija.com.br
              </p>
              <p>
                <i className="fas fa-clock"></i> Seg-Sex: 8h às 18h
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Servijá - Todos os direitos reservados.</p>
          </div>
        </div>
        <div
          className={`modal ${modalOpen ? 'active' : ''}`}
          onClick={handleOverlayClick}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <i className="fas fa-user-circle"></i> Detalhes do Profissional
              </h3>
              <button className="close-modal" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {selectedProfessional && (
                <>
                  <div className="modal-prof-name">
                    {selectedProfessional.nome}
                  </div>
                  <div className="modal-rating">
                    ⭐ {selectedProfessional.avaliacao || 'Novo'}
                  </div>
                  <div className="modal-info">
                    <p>
                      <strong>Profissão:</strong>{' '}
                      {selectedProfessional.profissao}
                    </p>
                    <p>
                      <strong>Experiência:</strong>{' '}
                      {selectedProfessional.experiencia || 'Não informada'}
                    </p>
                    <p>
                      <strong>Habilidades:</strong>{' '}
                      {selectedProfessional.habilidades?.join(', ') ||
                        'Não informadas'}
                    </p>
                    <p>
                      <strong>Localização:</strong>{' '}
                      {selectedProfessional.localizacao || 'Não informada'}
                    </p>
                  </div>
                  <button className="contact-btn" onClick={handleContact}>
                    Entrar em contato
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        {toast.visible && (
          <div
            className="success-toast"
            style={{ background: toast.isError ? '#dc2626' : '#f97316' }}
          >
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

export default Home;
