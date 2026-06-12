import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { listarProfissionais, listFavoriteUsers, toggleFavoriteUser } from '../../services/api';
import { getUserLocation, getUserCity } from '../../lib/userLocation';
import CitySearchBar from '../../components/CitySearchBar';
import FavoritesModal from '../../components/FavoritesModal';

const Home = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [prestadores, setPrestadores] = useState([]);
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    isError: false,
  });
  const [cidadeInput, setCidadeInput] = useState('');
  const [cidadeFiltro, setCidadeFiltro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, isError = false) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, message, isError });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ visible: false, message: '', isError: false });
    }, 3000);
  };

  const carregarFavoritosIds = async () => {
    try {
      const favData = await listFavoriteUsers(false, { limit: '50' });
      if (favData?.data) {
        setFavoritos(favData.data.map((fav: { favorite_user_id: number }) => fav.favorite_user_id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const carregarProfissionais = async (cidade?: string) => {
    setCarregando(true);
    try {
      const dados = await listarProfissionais(
        cidade ? { cidade, busca: cidade } : undefined,
      );
      if (dados.profissionais) {
        setPrestadores(dados.profissionais);
      } else if (Array.isArray(dados)) {
        setPrestadores(dados);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const carregarDados = async () => {
      await carregarProfissionais();
      await carregarFavoritosIds();
    };
    carregarDados();
  }, []);

  const clienteNome = usuario?.nome || 'Cliente';
  const clienteLocal = getUserLocation(usuario);
  const minhaCidade = getUserCity(usuario);

  const handleBuscarCidade = () => {
    const filtro = cidadeInput.trim();
    setCidadeFiltro(filtro);
    carregarProfissionais(filtro || undefined);
  };

  const handleLimparCidade = () => {
    setCidadeInput('');
    setCidadeFiltro('');
    carregarProfissionais();
  };

  const handleUsarMinhaCidade = () => {
    if (!minhaCidade) return;
    setCidadeInput(minhaCidade);
    setCidadeFiltro(minhaCidade);
    carregarProfissionais(minhaCidade);
  };

  const openModal = (id) => {
    const prof = prestadores.find((p) => p.id === id);
    setSelectedProfessional(prof);
    setModalOpen(true);
  };

  const handleToggleFavorite = async (e: React.MouseEvent, profId: number) => {
    e.stopPropagation();
    try {
      const res = await toggleFavoriteUser(profId, false);
      if (res.isFavorite) {
        setFavoritos((prev) => [...prev, profId]);
        showToast('Profissional adicionado aos favoritos! ❤️');
      } else {
        setFavoritos((prev) => prev.filter((id) => id !== profId));
        showToast('Profissional removido dos favoritos.');
      }
    } catch (error) {
      console.error(error);
      showToast('Erro ao atualizar favorito', true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProfessional(null);
  };

  const handleAnnouncementClick = (title) => {
    showToast(`✅ ${title} em desenvolvimento!`);
  };

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

  // Fake announcements data
  const announcements = [
    {
      id: 1,
      title: '🔧 Ofertas de Ferramentas',
      description: 'Descontos de até 30% em materiais de construção!',
      subText: 'Aproveite a semana do cliente',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      icon: 'fa-hard-hat',
    },
    {
      id: 2,
      title: '🧹 Limpeza Especial',
      description: '10% de desconto na primeira diarista!',
      subText: 'Novos clientes apenas',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      icon: 'fa-broom',
    },
    {
      id: 3,
      title: '🛡️ Seguro Garantido',
      description: 'Todos os serviços com seguro gratuito!',
      subText: 'Segurança em primeiro lugar',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      icon: 'fa-shield-halved',
    },
  ];

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
    body { background: #f0f4fa; color: #111827; }
    .home-container { width: 100%; min-height: 100vh; }
    .user-header { width: 100%; background: white; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 100; border-bottom: 1px solid #e6eef8; }
    .user-info h2 { font-size: 24px; margin-bottom: 5px; color: #0f172a; }
    .user-location { color: #64748b; font-size: 14px; display: flex; align-items: center; gap: 6px; }
    .user-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .icon-btn { width: 45px; height: 45px; border: none; border-radius: 12px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 18px; transition: 0.3s; cursor: pointer; }
    .icon-btn:hover { background: #3b82f6; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
    .main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 25px; padding: 30px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .section-header h3 { font-size: 22px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px; }
    .view-all-btn { font-size: 14px; color: #3b82f6; font-weight: 600; background: none; border: none; cursor: pointer; transition: 0.2s; }
    .view-all-btn:hover { color: #2563eb; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    .professional-card { background: white; padding: 22px; border-radius: 20px; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 12px rgba(0,0,0,0.05); border: 1px solid #e6eef8; }
    .professional-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(59, 130, 246, 0.12); border-color: #93c5fd; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .prof-avatar { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.4rem; }
    .prof-info { flex: 1; margin-left: 14px; }
    .prof-name { font-weight: 700; font-size: 17px; color: #0f172a; }
    .rating { color: #f59e0b; font-weight: 600; display: flex; align-items: center; gap: 4px; font-size: 14px; }
    .service-title { font-weight: 700; margin-bottom: 10px; color: #3b82f6; font-size: 15px; }
    .service-description { color: #64748b; margin-bottom: 15px; line-height: 1.5; font-size: 14px; }
    .service-meta { display: flex; justify-content: space-between; font-size: 13px; color: #4b5563; }
    .meta-item { display: flex; align-items: center; gap: 6px; }
    .announcements-grid { display: flex; flex-direction: column; gap: 18px; }
    .announcement-card { color: white; padding: 22px; border-radius: 20px; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
    .announcement-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
    .announcement-card h4 { margin-bottom: 10px; font-size: 18px; display: flex; align-items: center; gap: 10px; }
    .announcement-card p { margin-bottom: 6px; font-size: 14px; opacity: 0.95; }
    .announcement-subtext { font-size: 12px; opacity: 0.85; font-style: italic; }
    .footer { background: #0f172a; color: white; margin-top: 40px; padding-top: 50px; }
    .footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 30px; padding: 0 40px 40px; }
    .footer-col h4 { margin-bottom: 20px; color: #3b82f6; font-size: 18px; }
    .footer-col p, .footer-col a { color: #9ca3af; margin-bottom: 10px; display: block; text-decoration: none; font-size: 14px; transition: color 0.2s; }
    .footer-col a:hover { color: white; }
    .social-links { display: flex; gap: 12px; margin-top: 15px; }
    .social-links a { width: 40px; height: 40px; border-radius: 10px; background: #1f2937; display: flex; align-items: center; justify-content: center; transition: 0.3s; color: #9ca3af; }
    .social-links a:hover { background: #3b82f6; color: white; }
    .footer-bottom { border-top: 1px solid #374151; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
    .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; visibility: hidden; opacity: 0; transition: visibility 0.2s, opacity 0.2s; }
    .modal.active { visibility: visible; opacity: 1; }
    .modal-content { width: 90%; max-width: 600px; background: white; border-radius: 24px; overflow: hidden; animation: fade 0.3s ease; }
    @keyframes fade { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-header { padding: 22px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { font-size: 20px; display: flex; align-items: center; gap: 10px; }
    .close-modal { background: rgba(255,255,255,0.18); border: none; color: white; font-size: 28px; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .close-modal:hover { background: rgba(255,255,255,0.28); }
    .modal-body { padding: 28px; }
    .modal-prof-name { font-size: 26px; font-weight: 700; margin-bottom: 8px; color: #0f172a; }
    .modal-rating { color: #f59e0b; margin-bottom: 24px; display: flex; align-items: center; gap: 6px; font-size: 16px; }
    .modal-info p { margin-bottom: 14px; color: #374151; font-size: 15px; }
    .modal-info strong { color: #0f172a; }
    .contact-btn { width: 100%; margin-top: 24px; padding: 16px; border: none; border-radius: 16px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; font-size: 16px; font-weight: 700; cursor: pointer; transition: 0.3s; }
    .contact-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(59, 130, 246, 0.35); }
    .success-toast { position: fixed; top: 20px; right: 20px; padding: 16px 22px; border-radius: 14px; color: white; font-weight: 600; z-index: 99999; transition: 0.3s; box-shadow: 0 6px 20px rgba(0,0,0,0.18); }
    @media (max-width: 900px) { 
      .main-grid { grid-template-columns: 1fr; } 
      .user-header { padding: 20px; flex-direction: column; gap: 20px; align-items: flex-start; } 
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="home-container">
        <div className="user-header">
          <div className="user-info">
            <h2>Olá, {clienteNome.split(' ')[0]}!</h2>
            <div className="user-location">
              <i className="fas fa-map-marker-alt"></i> {clienteLocal}
            </div>
          </div>
          <div className="user-actions">
            <button
              className="icon-btn"
              onClick={() => setFavoritesModalOpen(true)}
              title="Favoritos"
            >
              <i className="fas fa-heart" style={{ color: '#ef4444' }}></i>
            </button>
            <button
              className="icon-btn"
              onClick={() => navigate('/client/proposals')}
              title="Propostas"
            >
              <i className="fas fa-file-contract"></i>
            </button>
            <button
              className="icon-btn"
              onClick={() => navigate('/client/services')}
              title="Meus Serviços"
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
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              title="Sair"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>

        <div className="main-grid">
          <div className="professionals-section">
            <div className="section-header">
              <h3>
                <i className="fas fa-users"></i> Profissionais próximos a você
              </h3>
            </div>

            <CitySearchBar
              value={cidadeInput}
              onChange={setCidadeInput}
              onSearch={handleBuscarCidade}
              onClear={handleLimparCidade}
              onUseMyCity={minhaCidade ? handleUsarMinhaCidade : undefined}
              myCityLabel={minhaCidade ? `Minha cidade (${minhaCidade})` : undefined}
              accentColor="#2563eb"
              placeholder="Filtrar profissionais por cidade..."
            />

            {cidadeFiltro && (
              <p className="city-filter-active">
                Exibindo profissionais em: <strong>{cidadeFiltro}</strong>
                {' '}({prestadores.length} resultado{prestadores.length !== 1 ? 's' : ''})
              </p>
            )}

            <div className="cards-grid">
              {carregando ? (
                <div className="professional-card" style={{ textAlign: 'center', padding: '2rem' }}>
                  <i className="fas fa-spinner fa-spin"></i> Buscando...
                </div>
              ) : prestadores.length > 0 ? (
                prestadores.map((prof) => (
                  <div
                    key={prof.id}
                    className="professional-card"
                    onClick={() => openModal(prof.id)}
                  >
                    <div className="card-header">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="prof-avatar">
                          {prof.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="prof-info">
                          <div className="prof-name">{prof.nome}</div>
                          <div className="rating">
                            <i className="fas fa-star"></i>{' '}
                            {prof.avaliacao || 'Novo'}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => handleToggleFavorite(e, prof.id)}
                        style={{ 
                          background: 'none', border: 'none', cursor: 'pointer', 
                          fontSize: '1.4rem', color: favoritos.includes(prof.id) ? '#ef4444' : '#cbd5e1',
                          transition: '0.2s', padding: '4px'
                        }}
                      >
                        <i className={favoritos.includes(prof.id) ? "fas fa-heart" : "far fa-heart"}></i>
                      </button>
                    </div>
                    <div className="service-title">
                      {prof.profissao || 'Profissional'}
                    </div>
                    <div className="service-description">
                      {prof.bio
                        ? prof.bio.length > 70
                          ? prof.bio.substring(0, 70) + '...'
                          : prof.bio
                        : 'Profissional disponível para serviços.'}
                    </div>
                    <div className="service-meta">
                      <span className="meta-item">
                        <i className="fas fa-map-marker-alt"></i>{' '}
                        {prof.localizacao || prof.cidade || prof.user_cidade || 'Local não informado'}
                      </span>
                      <span className="meta-item">💰 Sob consulta</span>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="professional-card"
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    gridColumn: '1/-1',
                  }}
                >
                  <i
                    className="fas fa-user-slash"
                    style={{
                      fontSize: '3rem',
                      marginBottom: '1rem',
                      color: '#93c5fd',
                    }}
                  ></i>
                  <p
                    style={{
                      color: '#64748b',
                      fontSize: '16px',
                      marginBottom: '6px',
                    }}
                  >
                    Nenhum profissional encontrado
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
                    Volte mais tarde ou publique um serviço!
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="announcement-section">
            <div className="section-header">
              <h3>
                <i className="fas fa-star"></i> Destaques
              </h3>
            </div>
            <div className="announcements-grid">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="announcement-card"
                  style={{ background: announcement.gradient }}
                  onClick={() => handleAnnouncementClick(announcement.title)}
                >
                  <h4>
                    <i className={`fas ${announcement.icon}`}></i>{' '}
                    {announcement.title}
                  </h4>
                  <p>{announcement.description}</p>
                  <div className="announcement-subtext">
                    {announcement.subText}
                  </div>
                </div>
              ))}
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
                    <i className="fas fa-star"></i>{' '}
                    {selectedProfessional.avaliacao || 'Novo'}
                  </div>
                  <div className="modal-info">
                    <p>
                      <strong>Profissão:</strong>{' '}
                      {selectedProfessional.profissao || 'Não informada'}
                    </p>
                    <p>
                      <strong>Experiência:</strong>{' '}
                      {selectedProfessional.experiencia || 'Não informada'}
                    </p>
                    <p>
                      <strong>Habilidades:</strong>{' '}
                      {Array.isArray(selectedProfessional.habilidades)
                        ? selectedProfessional.habilidades.join(', ')
                        : selectedProfessional.habilidades || 'Não informadas'}
                    </p>
                    <p>
                      <strong>Localização:</strong>{' '}
                      {selectedProfessional.localizacao ||
                        selectedProfessional.cidade ||
                        selectedProfessional.user_cidade ||
                        'Não informada'}
                    </p>
                    {selectedProfessional.bio && (
                      <p>
                        <strong>Sobre:</strong> {selectedProfessional.bio}
                      </p>
                    )}
                  </div>
                  <button className="contact-btn" onClick={handleContact}>
                    <i className="fas fa-paper-plane"></i> Entrar em contato
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {toast.visible && (
          <div
            className="success-toast"
            style={{ background: toast.isError ? '#dc2626' : '#3b82f6' }}
          >
            {toast.message}
          </div>
        )}

        <FavoritesModal
          isOpen={favoritesModalOpen}
          onClose={() => setFavoritesModalOpen(false)}
          userType="CLIENTE"
          onFavoritesUpdated={carregarFavoritosIds}
        />
      </div>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </>
  );
};

export default Home;
