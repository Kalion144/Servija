import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { listarPropostasMarketplace, demonstrarInteresse } from '../../services/api';

const Home = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [propostas, setPropostas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState(false);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, isError = false) => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToastMsg(msg);
    setToastError(isError);
    toastRef.current = setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    const carregar = async () => {
      try {
        const dados = await listarPropostasMarketplace();
        if (Array.isArray(dados)) setPropostas(dados);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  useEffect(() => {
    return () => { if (toastRef.current) clearTimeout(toastRef.current); };
  }, []);

  const userName = usuario?.nome || 'Profissional';
  const location =
    usuario?.perfilProfissional?.localizacao ||
    usuario?.perfilProfissional?.cidade ||
    'Localização não informada';

  const handleInteresse = async (proposta: any) => {
    if (proposta.jaInteressou) {
      showToast('Você já demonstrou interesse nesta proposta', true);
      return;
    }
    try {
      await demonstrarInteresse(proposta.id);
      setPropostas((prev) =>
        prev.map((p) => p.id === proposta.id ? { ...p, jaInteressou: true } : p)
      );
      showToast('✅ Interesse registrado! O cliente será notificado.');
    } catch (e: any) {
      showToast(e.message || 'Erro ao registrar interesse', true);
    }
  };

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f4f6fc; font-family: 'Inter', sans-serif; color: #1e2e3e; }

    .user-header {
      width: 100%; background: white; padding: 16px 32px;
      display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 100;
      flex-wrap: wrap; gap: 12px;
    }
    .user-info h2 { font-size: 1.3rem; font-weight: 700; color: #111827; margin-bottom: 3px; }
    .user-location { color: #6b7280; font-size: 0.85rem; display: flex; align-items: center; gap: 5px; }
    .user-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .icon-btn {
      width: 42px; height: 42px; border: none; border-radius: 12px;
      background: #f3f4f6; color: #374151;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 17px; transition: 0.2s; cursor: pointer;
    }
    .icon-btn:hover { background: #f97316; color: white; transform: translateY(-2px); }

    .profile-card {
      background: white; margin: 18px 20px; border-radius: 24px;
      padding: 16px 22px; display: flex; align-items: center;
      justify-content: space-between; flex-wrap: wrap; gap: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04); border: 1px solid #eef2f8;
    }
    .profile-left { display: flex; align-items: center; gap: 14px; }
    .avatar {
      width: 48px; height: 48px; border-radius: 50%; background: #eef2fb;
      display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
      overflow: hidden; border: 2px solid #e2e8f0;
    }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .prof-info h3 { font-size: 1.05rem; font-weight: 700; color: #1f3b4c; }
    .prof-loc { display: flex; align-items: center; gap: 5px; color: #5f7d9c; font-size: 0.8rem; margin-top: 2px; }
    .edit-loc-btn {
      background: #f0f4fa; padding: 7px 14px; border-radius: 40px;
      font-size: 0.78rem; font-weight: 600; color: #2c5a6e; cursor: pointer;
      transition: 0.2s; border: none;
    }
    .edit-loc-btn:hover { background: #e2ecf7; }

    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px 40px; }

    .section-header {
      display: flex; align-items: baseline; justify-content: space-between;
      flex-wrap: wrap; gap: 8px; margin: 24px 0 16px;
    }
    .section-title { font-size: 1.3rem; font-weight: 700; color: #1f3b4c; }
    .section-count {
      font-size: 0.82rem; font-weight: 600; color: #5f7d9c;
      background: #eef2fa; padding: 4px 12px; border-radius: 40px;
    }

    .proposals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; }

    .proposal-card {
      background: white; border-radius: 22px; padding: 20px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.05); border: 1.5px solid #eef2fa;
      transition: all 0.22s; display: flex; flex-direction: column; gap: 12px;
    }
    .proposal-card:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(0,0,0,0.09); border-color: #c8d8ec; }

    .card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .card-titulo { font-size: 1.05rem; font-weight: 700; color: #1f3b4c; flex: 1; }
    .badge-novo { background: #fef3c7; color: #b45309; font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 40px; white-space: nowrap; }

    .card-cliente { font-size: 0.82rem; color: #5f7d9c; display: flex; align-items: center; gap: 5px; }
    .card-desc { font-size: 0.87rem; color: #4b5563; line-height: 1.5; }

    .card-meta { display: flex; flex-wrap: wrap; gap: 10px; }
    .meta-pill {
      background: #f0f4fa; border-radius: 40px; padding: 5px 12px;
      font-size: 0.78rem; font-weight: 600; color: #374151;
      display: flex; align-items: center; gap: 5px;
    }
    .meta-pill.green { background: #ecfdf5; color: #065f46; }
    .meta-pill.orange { background: #fff7ed; color: #9a3412; }

    .btn-interesse {
      width: 100%; padding: 11px; border-radius: 14px; border: none;
      font-weight: 700; font-size: 0.9rem; cursor: pointer;
      transition: all 0.2s; font-family: inherit;
    }
    .btn-interesse.ativo {
      background: linear-gradient(95deg, #1f4e5f, #2c7a6e);
      color: white;
    }
    .btn-interesse.ativo:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
    .btn-interesse.ja-interessou {
      background: #ecfdf5; color: #065f46; border: 1.5px solid #6ee7b7; cursor: default;
    }

    .empty-state {
      text-align: center; padding: 60px 20px; color: #6b7280;
    }
    .empty-state .icon { font-size: 3rem; margin-bottom: 16px; }
    .empty-state p { font-size: 1rem; margin-bottom: 8px; }
    .empty-state small { font-size: 0.82rem; color: #9ca3af; }

    .skeleton { background: #eef2f9; border-radius: 22px; height: 200px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

    .toast {
      position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
      color: white; padding: 12px 24px; border-radius: 40px;
      font-weight: 600; font-size: 0.9rem; z-index: 9999;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    @media (max-width: 640px) {
      .user-header { padding: 14px 16px; }
      .profile-card { margin: 12px 12px; }
      .container { padding: 0 12px 40px; }
      .proposals-grid { grid-template-columns: 1fr; }
    }
  `;

  const foto = usuario?.foto;

  return (
    <>
      <style>{styles}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      <div className="user-header">
        <div className="user-info">
          <h2>Olá, {userName.split(' ')[0]}</h2>
          <div className="user-location">
            <i className="fas fa-map-marker-alt" /> {location}
          </div>
        </div>
        <div className="user-actions">
          <button className="icon-btn" title="Home" onClick={() => navigate('/professional/home')}>
            <i className="fas fa-home" />
          </button>
          <button className="icon-btn" title="Minhas propostas" onClick={() => navigate('/professional/proposals')}>
            <i className="fas fa-briefcase" />
          </button>
          <button className="icon-btn" title="Perfil" onClick={() => navigate('/professional/profile')}>
            <i className="fas fa-user" />
          </button>
          <button className="icon-btn" title="Sair" onClick={async () => { await logout(); navigate('/login'); }}>
            <i className="fas fa-sign-out-alt" />
          </button>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-left">
          <div className="avatar">
            {foto ? <img src={foto} alt="foto" /> : '👤'}
          </div>
          <div className="prof-info">
            <h3>{userName}</h3>
            <div className="prof-loc">
              <span>📍</span> {location}
            </div>
          </div>
        </div>
        <button className="edit-loc-btn" onClick={() => navigate('/professional/profile')}>
          Alterar local
        </button>
      </div>

      <div className="container">
        <div className="section-header">
          <div className="section-title">🔧 Propostas Disponíveis</div>
          {!loading && (
            <span className="section-count">
              {propostas.length} proposta{propostas.length !== 1 ? 's' : ''} aberta{propostas.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div className="proposals-grid">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" />)}
          </div>
        ) : propostas.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <p>Nenhuma proposta disponível no momento</p>
            <small>Volte mais tarde — clientes publicam novas propostas frequentemente.</small>
          </div>
        ) : (
          <div className="proposals-grid">
            {propostas.map((p) => (
              <div key={p.id} className="proposal-card">
                <div className="card-top">
                  <div className="card-titulo">{p.titulo}</div>
                  <span className="badge-novo">⭐ Novo</span>
                </div>

                <div className="card-cliente">
                  <i className="fas fa-user-circle" /> {p.clienteNome}
                </div>

                {p.descricao && (
                  <div className="card-desc">
                    {p.descricao.length > 120 ? p.descricao.slice(0, 120) + '…' : p.descricao}
                  </div>
                )}

                <div className="card-meta">
                  {p.valor && (
                    <span className="meta-pill green">
                      💰 R$ {Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  {p.prazo && (
                    <span className="meta-pill">
                      📅 {p.prazo}
                    </span>
                  )}
                  {!p.valor && !p.prazo && (
                    <span className="meta-pill orange">A combinar</span>
                  )}
                </div>

                <button
                  className={`btn-interesse ${p.jaInteressou ? 'ja-interessou' : 'ativo'}`}
                  onClick={() => handleInteresse(p)}
                  disabled={p.jaInteressou}
                >
                  {p.jaInteressou ? '✓ Interesse registrado' : 'Tenho interesse'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {toastMsg && (
        <div className="toast" style={{ background: toastError ? '#b91c1c' : '#1f6e5c' }}>
          {toastMsg}
        </div>
      )}
    </>
  );
};

export default Home;
