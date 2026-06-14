import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  listarTodosServicos,
  listFavoriteServices,
  toggleFavoriteService,
  obterStatusAssinatura,
  criarCheckoutAssinatura,
  type PlanId,
} from '../../services/api';
import { getUserLocation, getUserCity } from '../../lib/userLocation';
import CitySearchBar from '../../components/CitySearchBar';
import FavoritesModal from '../../components/FavoritesModal';
import PremiumPlansCard from '../../components/professional/PremiumPlansCard';

const Home = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [servicosDisponiveis, setServicosDisponiveis] = useState([]);
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [cidadeInput, setCidadeInput] = useState('');
  const [cidadeFiltro, setCidadeFiltro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanId>('FREE');
  const [dailyContacts, setDailyContacts] = useState({ current: 0, max: 3 });
  const toastTimeoutRef = useRef(null);

  const showToastMessage = (message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    setToastVisible(true);
    toastTimeoutRef.current = setTimeout(() => setToastVisible(false), 3000);
  };

  const carregarFavoritosIds = async () => {
    try {
      const favData = await listFavoriteServices(true, { limit: '50' });
      if (favData?.data) {
        setFavoritos(favData.data.map((fav: { favorite_service_id: number }) => fav.favorite_service_id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const carregarServicos = async (cidade?: string) => {
    setCarregando(true);
    try {
      const dados = await listarTodosServicos(
        cidade ? { cidade, busca: cidade } : undefined,
      );
      if (dados.servicos) {
        setServicosDisponiveis(dados.servicos);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const carregarDados = async () => {
      await carregarServicos();
      await carregarFavoritosIds();
      try {
        const status = await obterStatusAssinatura(true);
        if (status.plan) setCurrentPlan(status.plan);
        if (status.currentDailyContacts !== undefined) {
          setDailyContacts({
            current: status.currentDailyContacts,
            max: status.maxDailyContacts ?? 3,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };
    carregarDados();
  }, []);

  const userName = usuario?.nome || 'Profissional';
  const userLocation = getUserLocation(usuario);
  const minhaCidade = getUserCity(usuario);

  const handleBuscarCidade = () => {
    const filtro = cidadeInput.trim();
    setCidadeFiltro(filtro);
    carregarServicos(filtro || undefined);
  };

  const handleLimparCidade = () => {
    setCidadeInput('');
    setCidadeFiltro('');
    carregarServicos();
  };

  const handleUsarMinhaCidade = () => {
    if (!minhaCidade) return;
    setCidadeInput(minhaCidade);
    setCidadeFiltro(minhaCidade);
    carregarServicos(minhaCidade);
  };

  const handleCardClick = (servico) => {
    navigate(`/professional/service-details/${servico.id}`, {
      state: { servico },
    });
  };

  const handleToggleFavorite = async (e: React.MouseEvent, servicoId: number) => {
    e.stopPropagation();
    try {
      const res = await toggleFavoriteService(servicoId, true);
      if (res.isFavorite) {
        setFavoritos((prev) => [...prev, servicoId]);
        showToastMessage('Serviço adicionado aos favoritos! ❤️');
      } else {
        setFavoritos((prev) => prev.filter((id) => id !== servicoId));
        showToastMessage('Serviço removido dos favoritos.');
      }
    } catch (error) {
      console.error(error);
      showToastMessage('Erro ao atualizar favorito');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAnnouncementClick = (title) => {
    showToastMessage(`✅ ${title} em desenvolvimento!`);
  };

  const handleAssinarPlano = async (plan: PlanId, preco: number) => {
    if (preco === 0 || plan === currentPlan) {
      showToastMessage('Você já está neste plano!');
      return;
    }
    try {
      const { url } = await criarCheckoutAssinatura(plan, true);
      if (url) window.location.href = url;
      else showToastMessage('Erro ao abrir checkout');
    } catch (error) {
      console.error(error);
      showToastMessage(
        error instanceof Error ? error.message : 'Erro ao iniciar assinatura',
      );
    }
  };

  const announcements = [
    {
      id: 3,
      title: '💬 Chat em Tempo Real',
      description: 'Comunique-se diretamente com os clientes!',
      subText: 'Disponível para planos Pro e Premium',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      icon: 'fa-comments',
    },
  ];

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
    .home-container { width: 100%; min-height: 100vh; background: #fff7ed; color: #1f2937; }
    .user-header { width: 100%; background: white; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 100; flex-wrap: wrap; gap: 16px; border-bottom: 1px solid #fed7aa; }
    .user-info h2 { font-size: 24px; margin-bottom: 5px; color: #111827; }
    .user-location { color: #6b7280; font-size: 14px; display: flex; align-items: center; gap: 6px; }
    .user-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .icon-btn { width: 45px; height: 45px; border: none; border-radius: 12px; background: #fff7ed; color: #f97316; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; font-size: 18px; transition: 0.3s; cursor: pointer; }
    .icon-btn:hover { background: #f97316; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); }
    .avatar { width: 64px; height: 64px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white; font-weight: 700; }
    .user-details h3 { font-size: 1.4rem; font-weight: 700; color: #1f2937; }
    .user-details span { color: #9ca3af; font-size: 0.9rem; }
    .location { display: flex; align-items: center; gap: 6px; color: #6b7280; font-size: 0.9rem; margin-top: 4px; }
    .edit-icon { background: #fff7ed; padding: 10px 18px; border-radius: 40px; font-size: 0.85rem; font-weight: 600; color: #c2410c; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
    .edit-icon:hover { background: #fed7aa; }
    .main-grid { max-width: 1400px; margin: 0 auto; padding: 30px 40px 48px; display: grid; grid-template-columns: 2fr 1fr; gap: 28px; align-content: start; }
    .section-title { font-size: 1.6rem; font-weight: 700; color: #1f2937; margin: 16px 0 20px 0; display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; justify-content: space-between; }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 32px; }
    .service-card { background: white; border-radius: 24px; padding: 24px; box-shadow: 0 5px 15px rgba(0,0,0,0.06); transition: all 0.3s; border: 1px solid #fed7aa; cursor: pointer; }
    .service-card:hover { transform: translateY(-6px); box-shadow: 0 15px 30px rgba(249, 115, 22, 0.15); border-color: #fb923c; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .client-info { display: flex; align-items: center; gap: 12px; }
    .client-avatar { width: 48px; height: 48px; background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #c2410c; font-weight: 700; font-size: 1.3rem; }
    .client-name { font-weight: 700; font-size: 1.05rem; color: #1f2937; }
    .urgent-badge { background: #fee2e2; color: #dc2626; font-size: 0.75rem; font-weight: 700; padding: 6px 14px; border-radius: 40px; display: flex; align-items: center; gap: 5px; }
    .service-name { font-size: 1.05rem; font-weight: 700; color: #c2410c; background: #fff7ed; display: inline-block; padding: 6px 14px; border-radius: 40px; margin: 14px 0; }
    .service-description { color: #6b7280; margin-bottom: 16px; line-height: 1.5; font-size: 0.95rem; }
    .service-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; border-top: 1px solid #fed7aa; padding-top: 14px; }
    .distance-price { display: flex; gap: 16px; font-size: 0.9rem; font-weight: 600; color: #6b7280; }
    .price-tag { color: #16a34a; font-size: 1.1rem; font-weight: 700; }
    .announcements-grid { display: flex; flex-direction: column; gap: 18px; }
    .announcement-card { color: white; padding: 24px; border-radius: 24px; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
    .announcement-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
    .announcement-card h4 { margin-bottom: 10px; font-size: 18px; display: flex; align-items: center; gap: 10px; }
    .announcement-card p { margin-bottom: 6px; font-size: 14px; opacity: 0.95; }
    .announcement-subtext { font-size: 12px; opacity: 0.85; font-style: italic; }
    .dash-card {
      background: linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%);
      border-radius: 24px; padding: 22px; color: white; cursor: pointer;
      box-shadow: 0 8px 28px rgba(109,40,217,0.35);
      transition: transform 0.2s, box-shadow 0.2s; position: relative; overflow: hidden;
    }
    .dash-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(109,40,217,0.45); }
    .dash-card-glow {
      position: absolute; top: -30px; right: -30px; width: 120px; height: 120px;
      background: rgba(255,255,255,0.07); border-radius: 50%;
    }
    .dash-card-glow2 {
      position: absolute; bottom: -20px; left: 20px; width: 80px; height: 80px;
      background: rgba(255,255,255,0.05); border-radius: 50%;
    }
    .dash-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .dash-card-icon { width: 42px; height: 42px; background: rgba(255,255,255,0.15); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .dash-card-badge { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .dash-card-title { font-size: 17px; font-weight: 800; margin-bottom: 6px; }
    .dash-card-desc { font-size: 13px; opacity: 0.85; margin-bottom: 16px; line-height: 1.4; }
    .dash-kpi-row { display: flex; gap: 10px; }
    .dash-kpi { flex: 1; background: rgba(255,255,255,0.12); border-radius: 12px; padding: 10px 12px; }
    .dash-kpi-val { font-size: 18px; font-weight: 800; }
    .dash-kpi-lbl { font-size: 10px; opacity: 0.75; margin-top: 2px; }
    .dash-btn { margin-top: 14px; width: 100%; background: white; color: #6d28d9; border: none; border-radius: 12px; padding: 11px; font-size: 13px; font-weight: 800; cursor: pointer; transition: .2s; display: flex; align-items: center; justify-content: center; gap: 7px; }
    .dash-btn:hover { background: #f5f3ff; }
    .contacts-widget { display: flex; align-items: center; gap: 10px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 8px 14px; font-size: 13px; color: #92400e; }
    .contacts-bar-wrap { width: 80px; height: 6px; background: #fde8cc; border-radius: 99px; overflow: hidden; }
    .contacts-bar { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #f97316, #ea580c); transition: width 0.4s; }
    .contacts-bar.full { background: #dc2626; }
    .success-toast { position: fixed; top: 80px; right: 20px; padding: 14px 24px; border-radius: 40px; color: white; font-weight: 600; z-index: 9999; background: #f97316; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.35); animation: fadeInOut 3s ease forwards; }
    @keyframes fadeInOut { 0% { opacity: 0; transform: translateX(20px); } 15% { opacity: 1; transform: translateX(0); } 85% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(20px); visibility: hidden; } }
    @media (max-width: 1024px) { 
      .main-grid { grid-template-columns: 1fr; padding: 24px 20px 40px; } 
    }
    @media (max-width: 680px) { 
      .user-header { padding: 16px 20px; flex-direction: column; align-items: flex-start; } 
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="home-container">
      <div className="user-header">
        <div className="user-info">
          <h2>Olá, {userName.split(' ')[0]}!👋</h2>
          <div className="user-location">
            <i className="fas fa-map-marker-alt"></i> {userLocation}
          </div>
        </div>
        <div className="user-actions">
          <button
            className="icon-btn"
            onClick={() => navigate('/professional/home')}
            title="Início"
          >
            <i className="fas fa-home"></i>
          </button>
          <button
            className="icon-btn"
            onClick={() => setFavoritesModalOpen(true)}
            title="Favoritos"
          >
            <i className="fas fa-heart" style={{ color: '#ef4444' }}></i>
          </button>
          <button
            className="icon-btn"
            onClick={() => navigate('/professional/messages')}
            title="Mensagens"
          >
            <i className="fas fa-comments"></i>
          </button>
          <button
            className="icon-btn"
            onClick={() => navigate('/professional/profile')}
            title="Perfil"
          >
            <i className="fas fa-user"></i>
          </button>
          <div className="contacts-widget" title={`Você iniciou ${dailyContacts.current} de ${dailyContacts.max === 999 ? '∞' : dailyContacts.max} contatos hoje`}>
            <i className="fas fa-comments" />
            <span>
              <strong>{dailyContacts.current}</strong>
              /{dailyContacts.max === 999 ? '∞' : dailyContacts.max} hoje
            </span>
            {dailyContacts.max !== 999 && (
              <div className="contacts-bar-wrap">
                <div
                  className={`contacts-bar${dailyContacts.current >= dailyContacts.max ? ' full' : ''}`}
                  style={{ width: `${Math.min(100, (dailyContacts.current / dailyContacts.max) * 100)}%` }}
                />
              </div>
            )}
          </div>
          <button className="icon-btn" onClick={handleLogout} title="Sair">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>

   

      <div className="main-grid">
        <div className="services-section">
          <div className="section-title">
            <span>
              <i className="fas fa-wrench"></i> Serviços Recomendados
            </span>
            <span
              style={{ fontSize: '1rem', color: '#6b7280', fontWeight: '500' }}
            >
              {servicosDisponiveis.length} serviço{servicosDisponiveis.length !== 1 ? 's' : ''} disponíve{servicosDisponiveis.length !== 1 ? 'is' : 'l'}
            </span>
          </div>

          <CitySearchBar
            value={cidadeInput}
            onChange={setCidadeInput}
            onSearch={handleBuscarCidade}
            onClear={handleLimparCidade}
            onUseMyCity={minhaCidade ? handleUsarMinhaCidade : undefined}
            myCityLabel={minhaCidade ? `Minha cidade (${minhaCidade})` : undefined}
            accentColor="#f97316"
            placeholder="Filtrar serviços e clientes por cidade..."
          />

          {cidadeFiltro && (
            <p className="city-filter-active">
              Exibindo em: <strong>{cidadeFiltro}</strong>
              {' '}({servicosDisponiveis.length} resultado{servicosDisponiveis.length !== 1 ? 's' : ''})
            </p>
          )}

          <div className="services-grid">
            {carregando ? (
              <div className="service-card" style={{ textAlign: 'center', padding: '2rem' }}>
                <i className="fas fa-spinner fa-spin"></i> Buscando...
              </div>
            ) : servicosDisponiveis.length > 0 ? (
              servicosDisponiveis.map((servico) => (
                <div
                  key={servico.id}
                  className="service-card"
                  onClick={() => handleCardClick(servico)}
                >
                  <div className="card-header">
                    <div className="client-info">
                      <div className="client-avatar">
                        {servico.cliente_nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="client-name">{servico.cliente_nome}</div>
                        {(servico.cliente_cidade || servico.localizacao) && (
                          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>
                            <i className="fas fa-map-marker-alt"></i>{' '}
                            {servico.cliente_cidade
                              ? `${servico.cliente_cidade}${servico.cliente_estado ? ` - ${servico.cliente_estado}` : ''}`
                              : servico.localizacao}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {servico.urgente === 1 && (
                        <span className="urgent-badge">
                          <i className="fas fa-bolt"></i> Urgente
                        </span>
                      )}
                      <button 
                        onClick={(e) => handleToggleFavorite(e, servico.id)}
                        style={{ 
                          background: 'none', border: 'none', cursor: 'pointer', 
                          fontSize: '1.4rem', color: favoritos.includes(servico.id) ? '#ef4444' : '#cbd5e1',
                          transition: '0.2s', padding: '4px'
                        }}
                      >
                        <i className={favoritos.includes(servico.id) ? "fas fa-heart" : "far fa-heart"}></i>
                      </button>
                    </div>
                  </div>
                  <div className="service-name">{servico.titulo}</div>
                  {servico.descricao && (
                    <div className="service-description">
                      {servico.descricao.length > 100
                        ? servico.descricao.substring(0, 100) + '...'
                        : servico.descricao}
                    </div>
                  )}
                  <div className="service-footer">
                    <div className="distance-price">
                      <span>
                        <i className="fas fa-map-marker-alt"></i>{' '}
                        {servico.localizacao || 'Não informado'}
                      </span>
                      {servico.preco && (
                        <span className="price-tag">
                          💰 R${Number(servico.preco).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      style={{
                        background: '#f97316',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '8px 14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: '0.2s',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = '#ea580c')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = '#f97316')
                      }
                    >
                      Ver detalhes{' '}
                      <i
                        className="fas fa-arrow-right"
                        style={{ marginLeft: '4px' }}
                      ></i>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  background: 'white',
                  padding: '60px 40px',
                  borderRadius: '24px',
                  textAlign: 'center',
                  gridColumn: '1/-1',
                  border: '1px dashed #fed7aa',
                }}
              >
                <i
                  className="fas fa-inbox"
                  style={{
                    fontSize: '4rem',
                    marginBottom: '1rem',
                    color: '#fb923c',
                  }}
                ></i>
                <h3
                  style={{
                    fontSize: '1.4rem',
                    marginBottom: '8px',
                    color: '#1f2937',
                  }}
                >
                  Nenhum serviço disponível no momento
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
                  Volte mais tarde para ver novas oportunidades!
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="announcements-section">
          <div className="section-title">
            <span>
              <i className="fas fa-star"></i> Novidades para Você
            </span>
          </div>
          <div className="announcements-grid">
            {/* Dashboard card */}
            <div className="dash-card" onClick={() => navigate('/professional/dashboard')}>
              <div className="dash-card-glow" />
              <div className="dash-card-glow2" />
              <div className="dash-card-header">
                <div className="dash-card-icon"><i className="fas fa-chart-line" /></div>
                <span className="dash-card-badge">Tempo real</span>
              </div>
              <div className="dash-card-title">📊 Relatórios Avançados</div>
              <div className="dash-card-desc">
                Acompanhe ganhos, clientes atendidos, avaliações e muito mais.
              </div>
              <div className="dash-kpi-row">
                <div className="dash-kpi">
                  <div className="dash-kpi-val">
                    {dailyContacts.current}/{dailyContacts.max === 999 ? '∞' : dailyContacts.max}
                  </div>
                  <div className="dash-kpi-lbl">contatos hoje</div>
                </div>
                <div className="dash-kpi">
                  <div className="dash-kpi-val">{currentPlan}</div>
                  <div className="dash-kpi-lbl">plano ativo</div>
                </div>
              </div>
              <button className="dash-btn" onClick={(e) => { e.stopPropagation(); navigate('/professional/dashboard'); }}>
                <i className="fas fa-arrow-right" /> Ver relatório completo
              </button>
            </div>

            <PremiumPlansCard
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
                <div className="announcement-subtext">
                  {announcement.subText}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {toastVisible && <div className="success-toast">{toastMessage}</div>}

      <FavoritesModal
        isOpen={favoritesModalOpen}
        onClose={() => setFavoritesModalOpen(false)}
        userType="PROFISSIONAL"
        onFavoritesUpdated={carregarFavoritosIds}
      />
      </div>

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

export default Home;
