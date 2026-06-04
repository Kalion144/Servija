import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { listarTodosServicos } from '../../services/api';

const Home = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [servicosDisponiveis, setServicosDisponiveis] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [location, setLocation] = useState('Brasília - DF');
  const [planosAbertos, setPlanosAbertos] = useState(false);
  const toastTimeoutRef = useRef(null);

  const showToastMessage = (message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    setToastVisible(true);
    toastTimeoutRef.current = setTimeout(() => setToastVisible(false), 3000);
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dados = await listarTodosServicos();
        if (dados.servicos) {
          setServicosDisponiveis(dados.servicos);
        }
      } catch (error) {
        console.error(error);
      }
    };
    carregarDados();
  }, []);

  const userName = usuario?.nome || 'Profissional';

  const handleCardClick = (servico) => {
    navigate(`/professional/service-details/${servico.id}`, {
      state: { servico },
    });
  };

  const handleEditLocation = () => {
    const newLocation = prompt('Digite sua cidade e UF:', location);
    if (newLocation) setLocation(newLocation);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAnnouncementClick = (title: string) => {
    showToastMessage(`✅ ${title} em desenvolvimento!`);
  };

  const handleAssinarPlano = (e: React.MouseEvent, nome: string, preco: number) => {
    e.stopPropagation();
    if (preco === 0) {
      showToastMessage('Você já está no plano Free!');
    } else {
      showToastMessage(`✅ Assinatura do plano ${nome} em desenvolvimento!`);
    }
  };

  const announcements = [
    {
      id: 1,
      title: '💼 Premium Profissional',
      description: 'Ganhe destaque nos resultados de busca!',
      subText: 'Primeiro mês gratuito',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      icon: 'fa-gem',
      isPremiumCard: true,
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

  const planos = [
    {
      id: 1,
      nome: 'Free',
      preco: 0,
      precoLabel: 'Grátis',
      icone: 'fa-user',
      variante: 'inner-free',
      beneficios: ['3 clientes por dia', 'Perfil público'],
    },
    {
      id: 2,
      nome: 'Pro',
      preco: 59.99,
      precoLabel: 'R$ 59,99',
      icone: 'fa-briefcase',
      variante: 'inner-pro',
      beneficios: ['10 clientes/dia', 'Chat em tempo real', 'Impulso de ranking', 'Verificado'],
    },
    {
      id: 3,
      nome: 'Premium',
      preco: 129.99,
      precoLabel: 'R$ 129,99',
      icone: 'fa-gem',
      variante: 'inner-premium',
      popular: true,
      beneficios: ['Clientes ilimitados', 'Tudo do Pro', 'Clientes premium'],
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
    .profile-location-card { background: white; margin: 20px 40px 24px 40px; border-radius: 24px; padding: 20px 26px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; box-shadow: 0 6px 14px rgba(0,0,0,0.05); border: 1px solid #fed7aa; }
    .user-info-card { display: flex; align-items: center; gap: 16px; }
    .avatar { width: 64px; height: 64px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white; font-weight: 700; }
    .user-details h3 { font-size: 1.4rem; font-weight: 700; color: #1f2937; }
    .user-details span { color: #9ca3af; font-size: 0.9rem; }
    .location { display: flex; align-items: center; gap: 6px; color: #6b7280; font-size: 0.9rem; margin-top: 4px; }
    .edit-icon { background: #fff7ed; padding: 10px 18px; border-radius: 40px; font-size: 0.85rem; font-weight: 600; color: #c2410c; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
    .edit-icon:hover { background: #fed7aa; }
    .container { max-width: 1400px; margin: 0 auto; padding: 0 40px; display: grid; grid-template-columns: 2fr 1fr; gap: 28px; }
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
    .premium-card-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .premium-card-header h4 { margin-bottom: 0; }
    .premium-toggle-icon { font-size: 13px; opacity: 0.85; margin-top: 2px; transition: transform 0.3s; }
    .premium-toggle-icon.open { transform: rotate(180deg); }
    .premium-collapsed-info { margin-top: 10px; }
    .plans-expanded { margin-top: 16px; display: flex; flex-direction: column; gap: 10px; animation: slideDown 0.25s ease; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    .inner-plan { border-radius: 14px; padding: 14px 16px; position: relative; }
    .inner-plan.inner-free { background: rgba(255,255,255,0.95); color: #1f2937; }
    .inner-plan.inner-pro { background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.35); }
    .inner-plan.inner-premium { background: rgba(124,58,237,0.75); border: 1px solid rgba(255,255,255,0.3); }
    .inner-plan-badge { position: absolute; top: -9px; right: 12px; background: #fbbf24; color: #78350f; font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 40px; text-transform: uppercase; letter-spacing: 0.4px; }
    .inner-plan-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .inner-plan-nome { font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 6px; }
    .inner-plan.inner-free .inner-plan-nome { color: #1f2937; }
    .inner-plan-preco { font-size: 0.95rem; font-weight: 800; }
    .inner-plan-preco-sub { font-size: 0.68rem; opacity: 0.75; }
    .inner-plan-beneficios { list-style: none; padding: 0; margin: 0 0 10px; font-size: 0.78rem; display: flex; flex-direction: column; gap: 4px; }
    .inner-plan-beneficios li { display: flex; align-items: center; gap: 6px; }
    .inner-plan.inner-free .inner-plan-beneficios li { color: #374151; }
    .inner-plan.inner-free .inner-plan-beneficios li i { color: #f97316; font-size: 0.7rem; }
    .inner-plan.inner-pro .inner-plan-beneficios li i,
    .inner-plan.inner-premium .inner-plan-beneficios li i { color: #fbbf24; font-size: 0.7rem; }
    .inner-plan-btn { width: 100%; padding: 8px; border-radius: 10px; border: none; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .inner-plan.inner-free .inner-plan-btn { background: #fff7ed; color: #c2410c; }
    .inner-plan.inner-free .inner-plan-btn:hover { background: #fed7aa; }
    .inner-plan.inner-pro .inner-plan-btn,
    .inner-plan.inner-premium .inner-plan-btn { background: rgba(255,255,255,0.25); color: white; }
    .inner-plan.inner-pro .inner-plan-btn:hover,
    .inner-plan.inner-premium .inner-plan-btn:hover { background: rgba(255,255,255,0.38); }
    .success-toast { position: fixed; top: 80px; right: 20px; padding: 14px 24px; border-radius: 40px; color: white; font-weight: 600; z-index: 9999; background: #f97316; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.35); animation: fadeInOut 3s ease forwards; }
    @keyframes fadeInOut { 0% { opacity: 0; transform: translateX(20px); } 15% { opacity: 1; transform: translateX(0); } 85% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(20px); visibility: hidden; } }
    @media (max-width: 1024px) {
      .container { grid-template-columns: 1fr; padding: 0 20px; }
      .profile-location-card { margin: 20px 20px 24px 20px; }
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
            <i className="fas fa-map-marker-alt"></i> {location}
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

      <div className="profile-location-card">
        <div className="user-info-card">
          <div className="avatar">{userName.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <h3>{userName}</h3>
            <div className="location">
              <i className="fas fa-map-marker-alt"></i> {location}
            </div>
          </div>
        </div>
        <div className="edit-icon" onClick={handleEditLocation}>
          <i className="fas fa-pen"></i> Alterar local
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
              {servicosDisponiveis.length} serviços disponíveis
            </span>
          </div>

          <div className="services-grid">
            {servicosDisponiveis.length > 0 ? (
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
                      <div className="client-name">{servico.cliente_nome}</div>
                    </div>
                    {servico.urgente === 1 && (
                      <span className="urgent-badge">
                        <i className="fas fa-bolt"></i> Urgente
                      </span>
                    )}
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
            {announcements.map((announcement) => {
              if (announcement.isPremiumCard) {
                return (
                  <div
                    key={announcement.id}
                    className="announcement-card"
                    style={{ background: announcement.gradient }}
                    onClick={() => setPlanosAbertos((prev) => !prev)}
                  >
                    <div className="premium-card-header">
                      <h4>
                        <i className={`fas ${announcement.icon}`}></i>{' '}
                        {announcement.title}
                      </h4>
                      <i
                        className={`fas fa-chevron-down premium-toggle-icon${planosAbertos ? ' open' : ''}`}
                      ></i>
                    </div>

                    {!planosAbertos && (
                      <div className="premium-collapsed-info">
                        <p>{announcement.description}</p>
                        <div className="announcement-subtext">
                          {announcement.subText}
                        </div>
                      </div>
                    )}

                    {planosAbertos && (
                      <div className="plans-expanded">
                        {planos.map((plano) => (
                          <div
                            key={plano.id}
                            className={`inner-plan ${plano.variante}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {plano.popular && (
                              <div className="inner-plan-badge">
                                <i className="fas fa-crown"></i> Popular
                              </div>
                            )}
                            <div className="inner-plan-top">
                              <div className="inner-plan-nome">
                                <i className={`fas ${plano.icone}`}></i>{' '}
                                {plano.nome}
                              </div>
                              <div>
                                <div className="inner-plan-preco">
                                  {plano.precoLabel}
                                </div>
                                {plano.preco > 0 && (
                                  <div className="inner-plan-preco-sub">
                                    /mês
                                  </div>
                                )}
                              </div>
                            </div>
                            <ul className="inner-plan-beneficios">
                              {plano.beneficios.map((b, i) => (
                                <li key={i}>
                                  <i className="fas fa-check-circle"></i> {b}
                                </li>
                              ))}
                            </ul>
                            <button
                              className="inner-plan-btn"
                              onClick={(e) =>
                                handleAssinarPlano(e, plano.nome, plano.preco)
                              }
                            >
                              {plano.preco === 0
                                ? 'Plano atual'
                                : `Assinar ${plano.nome}`}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
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
              );
            })}
          </div>
        </div>
      </div>

      {toastVisible && <div className="success-toast">{toastMessage}</div>}
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
