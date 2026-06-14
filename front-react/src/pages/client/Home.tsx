import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  listarProfissionais,
  listFavoriteUsers,
  toggleFavoriteUser,
  obterStatusAssinatura,
  criarCheckoutAssinatura,
  type PlanId,
} from '../../services/api';
import { getUserLocation, getUserCity } from '../../lib/userLocation';
import CitySearchBar from '../../components/CitySearchBar';
import FavoritesModal from '../../components/FavoritesModal';
import ClientPremiumPlansCard from '../../components/client/ClientPremiumPlansCard';

const Home = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [prestadores, setPrestadores] = useState([]);
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', isError: false });
  const [cidadeInput, setCidadeInput] = useState('');
  const [cidadeFiltro, setCidadeFiltro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanId>('FREE');
  const toastTimeoutRef = useRef(null);

  const showToast = (message: string, isError = false) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, message, isError });
    toastTimeoutRef.current = setTimeout(
      () => setToast({ visible: false, message: '', isError: false }),
      3500,
    );
  };

  const carregarFavoritosIds = async () => {
    try {
      const favData = await listFavoriteUsers(false, { limit: '50' });
      if (favData?.data) {
        setFavoritos(
          favData.data.map((fav: { favorite_user_id: number }) => fav.favorite_user_id),
        );
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
      try {
        const status = await obterStatusAssinatura(false);
        if (status.plan) setCurrentPlan(status.plan);
      } catch (error) {
        console.error(error);
      }
    };
    carregarDados();
  }, []);

  useEffect(() => {
    return () => { if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current); };
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

  const openModal = (prof: any) => {
    setSelectedProfessional(prof);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProfessional(null);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModal();
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

  const handleAnnouncementClick = (title: string) => {
    showToast(`✅ ${title} em desenvolvimento!`);
  };

  const handleAssinarPlano = async (plan: PlanId, preco: number) => {
    if (preco === 0 || plan === currentPlan) {
      showToast('Você já está neste plano!');
      return;
    }
    try {
      const { url } = await criarCheckoutAssinatura(plan, false);
      if (url) window.location.href = url;
      else showToast('Erro ao abrir checkout', true);
    } catch (error) {
      console.error(error);
      showToast(
        error instanceof Error ? error.message : 'Erro ao iniciar assinatura',
        true,
      );
    }
  };

  const handleContact = () => {
    showToast('📞 Contato enviado com sucesso!');
    closeModal();
  };

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
    .user-header { width: 100%; background: white; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 100; border-bottom: 1px solid #e6eef8; flex-wrap: wrap; gap: 16px; }
    .user-info h2 { font-size: 24px; margin-bottom: 5px; color: #0f172a; }
    .user-location { color: #64748b; font-size: 14px; display: flex; align-items: center; gap: 6px; }
    .user-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .icon-btn { width: 45px; height: 45px; border: none; border-radius: 12px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 18px; transition: 0.3s; cursor: pointer; }
    .icon-btn:hover { background: #3b82f6; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
    .main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 25px; padding: 30px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .section-header h3 { font-size: 22px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    .professional-card { background: white; padding: 22px; border-radius: 20px; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 12px rgba(0,0,0,0.05); border: 1px solid #e6eef8; position: relative; }
    .professional-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(59, 130, 246, 0.12); border-color: #93c5fd; }
    .professional-card.is-premium-pro { border-color: #c4b5fd; box-shadow: 0 2px 12px rgba(124,58,237,0.08); }
    .professional-card.is-premium-pro:hover { border-color: #7c3aed; box-shadow: 0 10px 25px rgba(124,58,237,0.15); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .prof-avatar { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.4rem; flex-shrink: 0; }
    .prof-avatar.avatar-pro { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); }
    .prof-avatar.avatar-premium { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); }
    .prof-info { flex: 1; margin-left: 14px; min-width: 0; }
    .prof-name-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .prof-name { font-weight: 700; font-size: 17px; color: #0f172a; }
    .verified-badge { display: inline-flex; align-items: center; gap: 3px; background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; border: 1px solid #bfdbfe; white-space: nowrap; }
    .plan-badge { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; white-space: nowrap; }
    .plan-badge.pro { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
    .plan-badge.premium { background: #f5f3ff; color: #6d28d9; border: 1px solid #ddd6fe; }
    .rating { color: #f59e0b; font-weight: 600; display: flex; align-items: center; gap: 4px; font-size: 14px; margin-top: 3px; }
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
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 16px; }
    .modal-box { width: 100%; max-width: 480px; background: white; border-radius: 24px; overflow: hidden; animation: fadeUp 0.25s ease; }
    @keyframes fadeUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-head { padding: 18px 22px; background: linear-gradient(95deg, #2563eb, #1d4ed8); color: white; display: flex; justify-content: space-between; align-items: center; }
    .modal-head h3 { font-size: 1rem; font-weight: 700; }
    .close-btn { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; line-height: 1; }
    .modal-body { padding: 22px; }
    .modal-prof-name { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .modal-rating { color: #f59e0b; font-size: 1rem; font-weight: 600; margin-bottom: 14px; }
    .modal-info { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
    .modal-info p { font-size: 0.9rem; color: #374151; }
    .modal-info strong { color: #0f172a; }
    .contact-btn { width: 100%; padding: 13px; border: none; border-radius: 14px; background: #2563eb; color: white; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: 0.2s; font-family: inherit; }
    .contact-btn:hover { background: #1d4ed8; }
    .footer { background: #0f172a; color: white; margin-top: 40px; padding-top: 50px; }
    .footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 30px; padding: 0 40px 40px; }
    .footer-col h4 { margin-bottom: 20px; color: #3b82f6; font-size: 18px; }
    .footer-col p, .footer-col a { color: #9ca3af; margin-bottom: 10px; display: block; text-decoration: none; font-size: 14px; transition: color 0.2s; cursor: pointer; }
    .footer-col a:hover { color: white; }
    .footer-bottom { border-top: 1px solid #374151; padding: 16px 40px 20px; text-align: center; color: #9ca3af; font-size: 0.82rem; }
    .success-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); color: white; padding: 14px 24px; border-radius: 40px; font-weight: 600; z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.2); animation: slideUp 0.3s ease; }
    @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
    .city-filter-active { font-size: 0.9rem; color: #64748b; margin-bottom: 16px; }
    @media (max-width: 1024px) { .main-grid { grid-template-columns: 1fr; padding: 20px; } }
    @media (max-width: 680px) { .user-header { padding: 14px 16px; flex-direction: column; align-items: flex-start; } }
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
              onClick={() => navigate('/client/messages')}
              title="Mensagens"
            >
              <i className="fas fa-comments"></i>
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
              onClick={async () => { await logout(); navigate('/'); }}
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
                    className={`professional-card${prof.plan === 'PREMIUM' ? ' is-premium-pro' : ''}`}
                    onClick={() => openModal(prof)}
                  >
                    <div className="card-header">
                      <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                        <div
                          className={`prof-avatar${prof.plan === 'PRO' ? ' avatar-pro' : prof.plan === 'PREMIUM' ? ' avatar-premium' : ''}`}
                        >
                          {prof.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="prof-info">
                          <div className="prof-name-row">
                            <span className="prof-name">{prof.nome}</span>
                            {prof.verified && (
                              <span className="verified-badge">
                                <i className="fas fa-check-circle" /> Verificado
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <div className="rating">
                              <i className="fas fa-star" />{' '}
                              {prof.avaliacao ? Number(prof.avaliacao).toFixed(1) : 'Novo'}
                            </div>
                            {prof.plan === 'PRO' && <span className="plan-badge pro">💼 Pro</span>}
                            {prof.plan === 'PREMIUM' && <span className="plan-badge premium">💎 Premium</span>}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleToggleFavorite(e, prof.id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: '1.4rem',
                          color: favoritos.includes(prof.id) ? '#ef4444' : '#cbd5e1',
                          transition: '0.2s', padding: '4px',
                        }}
                      >
                        <i className={favoritos.includes(prof.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                      </button>
                    </div>
                    <div className="service-title">{prof.profissao || 'Profissional'}</div>
                    <div className="service-description">
                      {prof.bio
                        ? prof.bio.length > 70 ? prof.bio.substring(0, 70) + '...' : prof.bio
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
                  style={{ textAlign: 'center', padding: '40px 20px', gridColumn: '1/-1' }}
                >
                  <i className="fas fa-user-slash" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#93c5fd' }}></i>
                  <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '6px' }}>Nenhum profissional encontrado</p>
                  <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Volte mais tarde ou publique um serviço!</p>
                </div>
              )}
            </div>
          </div>

          <div className="announcement-section">
            <div className="section-header">
              <h3><i className="fas fa-star"></i> Destaques</h3>
            </div>
            <div className="announcements-grid">
              <ClientPremiumPlansCard
                currentPlan={currentPlan}
                onSubscribe={handleAssinarPlano}
              />
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
                  <div className="announcement-subtext">{announcement.subText}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-col">
              <h4>ServiJá</h4>
              <p>Conectando clientes a profissionais qualificados.</p>
            </div>
            <div className="footer-col">
              <h4>Para Clientes</h4>
              <a onClick={() => navigate('/client/post-service')}>Publicar Serviço</a>
              <a onClick={() => navigate('/client/services')}>Meus Serviços</a>
            </div>
            <div className="footer-col">
              <h4>Suporte</h4>
              <p>suporte@servija.com.br</p>
            </div>
          </div>
          <div className="footer-bottom">© 2024 ServiJá — Todos os direitos reservados.</div>
        </footer>
      </div>

      {modalOpen && selectedProfessional && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-box">
            <div className="modal-head">
              <h3><i className="fas fa-user-circle" /> Perfil do Profissional</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-prof-name">{selectedProfessional.nome}</div>
              <div className="modal-rating">
                <i className="fas fa-star"></i>{' '}
                {selectedProfessional.avaliacao ? Number(selectedProfessional.avaliacao).toFixed(1) : 'Novo'}
              </div>
              <div className="modal-info">
                <p><strong>Profissão:</strong> {selectedProfessional.profissao || 'Não informada'}</p>
                <p>
                  <strong>Localização:</strong>{' '}
                  {selectedProfessional.localizacao || selectedProfessional.cidade || selectedProfessional.user_cidade || 'Não informada'}
                </p>
                {selectedProfessional.experiencia && (
                  <p><strong>Experiência:</strong> {selectedProfessional.experiencia}</p>
                )}
                {Array.isArray(selectedProfessional.habilidades) && selectedProfessional.habilidades.length > 0 && (
                  <p><strong>Habilidades:</strong> {selectedProfessional.habilidades.join(', ')}</p>
                )}
                {selectedProfessional.bio && (
                  <p><strong>Sobre:</strong> {selectedProfessional.bio}</p>
                )}
              </div>
              <button className="contact-btn" onClick={handleContact}>
                <i className="fas fa-paper-plane"></i> Entrar em contato
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.visible && (
        <div
          className="success-toast"
          style={{ background: toast.isError ? '#dc2626' : '#2563eb' }}
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
