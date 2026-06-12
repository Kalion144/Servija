import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { listarTodosServicos, listFavoriteServices, toggleFavoriteService } from '../../services/api';
import { getUserLocation, getUserCity } from '../../lib/userLocation';
import CitySearchBar from '../../components/CitySearchBar';
import FavoritesModal from '../../components/FavoritesModal';

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

  // Fake announcements for professionals
  const announcements = [
    {
      id: 1,
      title: '💼 Premium Profissional',
      description: 'Ganhe destaque nos resultados de busca!',
      subText: 'Primeiro mês gratuito',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      icon: 'fa-gem',
    },
    {
      id: 2,
      title: '📊 Relatórios Avançados',
      description: 'Acompanhe suas métricas em tempo real!',
      subText: 'Disponível para todos',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      icon: 'fa-chart-line',
    },
    {
      id: 3,
      title: '💬 Chat em Tempo Real',
      description: 'Comunique-se diretamente com os clientes!',
      subText: 'Novidade exclusiva',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      icon: 'fa-comments',
    },
  ];

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
    body { background: #fff7ed; color: #1f2937; padding: 0 0 32px 0; }
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
    .container { max-width: 1400px; align-content: start; margin: 0 auto; padding: 0 40px; display: grid; grid-template-columns: 2fr 1fr; gap: 28px; }
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
    .success-toast { position: fixed; top: 80px; right: 20px; padding: 14px 24px; border-radius: 40px; color: white; font-weight: 600; z-index: 9999; background: #f97316; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.35); animation: fadeInOut 3s ease forwards; }
    @keyframes fadeInOut { 0% { opacity: 0; transform: translateX(20px); } 15% { opacity: 1; transform: translateX(0); } 85% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(20px); visibility: hidden; } }
    @media (max-width: 1024px) { 
      .container { grid-template-columns: 1fr;  padding: 0 20px; } 
    }
    @media (max-width: 680px) { 
      .user-header { padding: 16px 20px; flex-direction: column; align-items: flex-start; } 
    }
  `;

  return (
    <>
      <style>{styles}</style>
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
            onClick={() => navigate('/professional/proposals')}
            title="Minhas Propostas"
          >
            <i className="fas fa-briefcase"></i>
          </button>
          <button
            className="icon-btn"
            onClick={() => navigate('/professional/profile')}
            title="Perfil"
          >
            <i className="fas fa-user"></i>
          </button>
          <button className="icon-btn" onClick={handleLogout} title="Sair">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>

   

      <div className="container">
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
