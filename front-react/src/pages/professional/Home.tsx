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
  const [location, setLocation] = useState('Brasília - DF');

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

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f4f6fc; font-family: 'Inter', sans-serif; padding: 0 0 32px 0; color: #1e2e3e; }
    .user-header { width: 100%; background: white; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 100; flex-wrap: wrap; gap: 16px; }
    .user-info h2 { font-size: 24px; margin-bottom: 5px; color: #111827; }
    .user-location { color: #6b7280; font-size: 14px; display: flex; align-items: center; gap: 6px; }
    .user-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .icon-btn { width: 45px; height: 45px; border: none; border-radius: 12px; background: #f3f4f6; color: #374151; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; font-size: 18px; transition: 0.3s; cursor: pointer; }
    .icon-btn:hover { background: #f97316; color: white; transform: translateY(-2px); }
    .profile-location-card { background: white; margin: 20px 20px 24px 20px; border-radius: 28px; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; box-shadow: 0 6px 14px rgba(0,0,0,0.03); border: 1px solid #eef2f8; }
    .user-info-card { display: flex; align-items: center; gap: 14px; }
    .avatar { width: 52px; height: 52px; background: #eef2fb; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; }
    .user-details h3 { font-size: 1.25rem; font-weight: 700; color: #1f3b4c; }
    .location { display: flex; align-items: center; gap: 6px; color: #5f7d9c; font-size: 0.85rem; margin-top: 4px; }
    .edit-icon { background: #f0f4fa; padding: 8px 16px; border-radius: 40px; font-size: 0.8rem; font-weight: 600; color: #2c5a6e; cursor: pointer; transition: 0.2s; }
    .edit-icon:hover { background: #e6edf6; }
    .container { max-width: 1300px; margin: 0 auto; padding: 0 20px; }
    .section-title { font-size: 1.5rem; font-weight: 700; color: #1f3b4c; margin: 28px 0 16px 0; display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; justify-content: space-between; }
    .services-grid { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 32px; }
    .service-card { flex: 1; min-width: 260px; background: white; border-radius: 28px; padding: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); transition: all 0.25s; border: 1px solid #eef2fa; cursor: pointer; }
    .service-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -12px rgba(0,0,0,0.12); border-color: #d4e2f0; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .prof-name { font-weight: 800; font-size: 1.2rem; color: #1f3b4c; }
    .rating { background: #f5b34220; padding: 4px 10px; border-radius: 30px; color: #c97e00; font-weight: 700; font-size: 0.85rem; }
    .service-name { font-size: 1rem; font-weight: 600; color: #2c5e6e; background: #eef6fa; display: inline-block; padding: 5px 14px; border-radius: 40px; margin: 12px 0; }
    .service-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; border-top: 1px solid #edf2f8; padding-top: 14px; }
    .urgent-badge { background: #ffe8e6; color: #bc3900; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 40px; }
    .distance-price { display: flex; gap: 12px; font-size: 0.85rem; font-weight: 500; color: #5a6e8a; }
    .success-toast { position: fixed; top: 80px; right: 20px; padding: 12px 20px; border-radius: 40px; color: white; font-weight: 600; z-index: 9999; background: #f97316; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: fadeInOut 3s ease forwards; }
    @keyframes fadeInOut { 0% { opacity: 0; transform: translateX(20px); } 15% { opacity: 1; transform: translateX(0); } 85% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(20px); visibility: hidden; } }
    @media (max-width: 680px) { .user-header { padding: 16px 20px; flex-direction: column; align-items: flex-start; } .profile-location-card { margin: 12px 16px 20px; } .container { padding: 0 16px; } }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="user-header">
        <div className="user-info">
          <h2>Olá, {userName.split(' ')[0]}</h2>
          <div className="user-location">
            <i className="fas fa-map-marker-alt"></i> {location}
          </div>
        </div>
        <div className="user-actions">
          <button
            className="icon-btn"
            onClick={() => navigate('/professional/home')}
          >
            <i className="fas fa-home"></i>
          </button>
          <button
            className="icon-btn"
            onClick={() => navigate('/professional/proposals')}
          >
            <i className="fas fa-briefcase"></i>
          </button>
          <button
            className="icon-btn"
            onClick={() => navigate('/professional/profile')}
          >
            <i className="fas fa-user"></i>
          </button>
          <button className="icon-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
      <div className="profile-location-card">
        <div className="user-info-card">
          <div className="avatar">👤</div>
          <div className="user-details">
            <h3>{userName}</h3>
            <div className="location">
              <span>📍</span> {location}
            </div>
          </div>
        </div>
        <div className="edit-icon" onClick={handleEditLocation}>
          Alterar local
        </div>
      </div>
      <div className="container">
        <div className="section-title">
          🔧 Serviços Recomendados <span>Próximo de você</span>
        </div>
        <div className="services-grid">
          {servicosDisponiveis.map((servico) => (
            <div
              key={servico.id}
              className="service-card"
              onClick={() => handleCardClick(servico)}
            >
              <div className="card-header">
                <span className="prof-name">{servico.cliente_nome}</span>
                <span className="rating">⭐ Novo</span>
              </div>
              <div className="service-name">{servico.titulo}</div>
              <div className="service-footer">
                <div className="distance-price">
                  📍 {servico.prazo || '—'} •{' '}
                  {servico.valor ? `R$${servico.valor.toFixed(2)}` : '—'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {toastVisible && <div className="success-toast">{toastMessage}</div>}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
    </>
  );
};

export default Home;
