import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listarMinhasPropostasProfissional } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

type FiltroProposta = 'all' | 'PENDENTE' | 'ACEITA' | 'RECUSADA';

interface PropostaApi {
  id: number;
  client_id: number;
  titulo: string;
  descricao: string;
  valor: number;
  prazo: string;
  status: string;
  created_at: string;
  proposalProfessional: {
    id: number;
    proposal_id: number;
    professional_id: number;
    status: 'PENDENTE' | 'ACEITA' | 'RECUSADA';
  };
}

const Proposals: React.FC = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const [propostas, setPropostas] = useState<PropostaApi[]>([]);
  const [currentFilter, setCurrentFilter] = useState<FiltroProposta>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'normal'>(
    'normal'
  );
  const [loading, setLoading] = useState(true);

  const loadPropostas = async () => {
    try {
      setLoading(true);
      const dados = await listarMinhasPropostasProfissional();
      setPropostas(dados);
    } catch (error) {
      console.error(error);
      setToastMessage('Erro ao carregar propostas');
      setToastType('error');
    } finally {
      setLoading(false);
    }
  };

  const filteredPropostas = propostas.filter((proposta) => {
    if (currentFilter === 'all') return true;
    return proposta.proposalProfessional.status === currentFilter;
  });

  const escapeHtml = (str: string): string => {
    if (!str) return '';
    return str.replace(/[&<>]/g, (m) => {
      if (m === '&') return '&amp;';
      if (m === '<') return '<';
      if (m === '>') return '>';
      return m;
    });
  };

  const renderPropostas = (): React.ReactNode => {
    if (loading) {
      return (
        <div className="empty-state" id="emptyState">
          <span>⏳</span>
          <p style={{ marginTop: '12px' }}>Carregando propostas...</p>
        </div>
      );
    }

    if (filteredPropostas.length === 0) {
      return (
        <div className="empty-state" id="emptyState">
          <span>📭</span>
          <p style={{ marginTop: '12px' }}>
            Você ainda não tem nenhuma proposta.
          </p>
        </div>
      );
    }

    return (
      <>
        {filteredPropostas.map((proposta) => {
          let statusClass = '';
          let statusText = '';
          if (proposta.proposalProfessional.status === 'PENDENTE') {
            statusClass = 'status-aguardando';
            statusText = '⏳ Aguardando resposta';
          } else if (proposta.proposalProfessional.status === 'ACEITA') {
            statusClass = 'status-aceita';
            statusText = '✅ Aceita';
          } else if (proposta.proposalProfessional.status === 'RECUSADA') {
            statusClass = 'status-recusada';
            statusText = '❌ Recusada';
          }

          let valorDisplay = proposta.valor
            ? `R$ ${proposta.valor.toFixed(2)}`
            : 'Não informado';

          const dataObj = new Date(proposta.created_at);
          const dataFormatada =
            dataObj.toLocaleDateString('pt-BR') +
            ' às ' +
            dataObj.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            });

          return (
            <div
              className="proposal-card"
              key={proposta.id}
              data-id={proposta.id}
            >
              <div className="card-header">
                <div className="client-info">
                  <h3>{escapeHtml(proposta.titulo)}</h3>
                  <div className="service-tag">
                    🔧 {escapeHtml(proposta.descricao || 'Descrição')}
                  </div>
                </div>
                <div className={`status-badge ${statusClass}`}>
                  {statusText}
                </div>
              </div>
              <div className="proposal-details">
                <div className="proposal-message">
                  <strong>💬 Descrição:</strong>
                  <br />
                  {escapeHtml(
                    proposta.descricao.length > 150
                      ? proposta.descricao.substring(0, 150) + '...'
                      : proposta.descricao
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '8px',
                  }}
                >
                  <span className="proposal-value">💰 {valorDisplay}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      background: '#f0f4fa',
                      padding: '2px 12px',
                      borderRadius: '60px',
                    }}
                  >
                    📅 {dataFormatada}
                  </span>
                </div>
              </div>
              <div className="proposal-date">
                <span>📨 Proposta ID: {proposta.id}</span>
                <Link
                  to={`/client/proposals/${proposta.id}`}
                  className="detail-link"
                >
                  Ver detalhes →
                </Link>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (window.confirm('Deseja realmente sair da sua conta?')) {
      await logout();
      setToastMessage('🔐 Logout realizado com sucesso!');
      setToastType('success');
      setTimeout(() => {
        navigate('/');
      }, 800);
    }
  };

  useEffect(() => {
    loadPropostas();

    const timer = setTimeout(() => {
      const total = propostas.length;
      if (total > 0) {
        setToastMessage(
          `📬 Você tem ${total} proposta(s) no total. Use os filtros para organizar.`
        );
      } else {
        setToastMessage(
          'Envie sua primeira proposta clicando em "Tenho interesse" em algum serviço'
        );
      }
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: linear-gradient(135deg, #f0f4fa 0%, #e0e8f2 100%);
      font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      padding: 20px 20px 40px;
      color: #1e2e3e;
    }

    .proposals-container {
      max-width: 1000px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 48px;
      box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }

    .page-header {
      background: linear-gradient(115deg, #1f3b4c, #1c5a6b);
      padding: 32px 36px 28px;
      color: white;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.3px;
      margin-bottom: 16px;
    }

    .header-row {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 20px;
      flex-wrap: wrap;
    }

    .user-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .icon-btn {
      width: 45px;
      height: 45px;
      border: none;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.15);
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      font-size: 18px;
      transition: 0.3s;
      cursor: pointer;
    }

    .icon-btn:hover {
      background: #f97316;
      color: white;
      transform: translateY(-2px);
    }

    .page-header p {
      opacity: 0.9;
      font-weight: 500;
      font-size: 0.9rem;
      margin: 0;
    }

    .filters-bar {
      padding: 24px 36px 0px 36px;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      border-bottom: 1px solid #eef2f8;
    }

    .filter-btn {
      background: transparent;
      border: none;
      padding: 10px 20px;
      font-weight: 600;
      font-size: 0.9rem;
      border-radius: 40px;
      cursor: pointer;
      transition: all 0.2s;
      color: #5f7d9c;
    }

    .filter-btn.active {
      background: #1f3b4c;
      color: white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.05);
    }

    .filter-btn:hover:not(.active) {
      background: #eef3fc;
      color: #1f5e55;
    }

    .proposals-list {
      padding: 28px 36px 32px;
      min-height: 380px;
    }

    .proposal-card {
      background: #ffffff;
      border: 1px solid #ecf3f9;
      border-radius: 32px;
      padding: 24px;
      margin-bottom: 20px;
      transition: all 0.2s;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .proposal-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 20px -10px rgba(0, 0, 0, 0.1);
      border-color: #d4e2f0;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 16px;
    }

    .client-info h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #1f3b4c;
    }

    .service-tag {
      background: #eef3fc;
      padding: 4px 14px;
      border-radius: 40px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #2c5a6e;
      display: inline-block;
      margin-top: 6px;
    }

    .status-badge {
      padding: 6px 16px;
      border-radius: 60px;
      font-weight: 700;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .status-aguardando {
      background: #fff3e0;
      color: #c96f0e;
    }

    .status-aceita {
      background: #e0f2e9;
      color: #1f6e5c;
    }

    .status-recusada {
      background: #ffe6e2;
      color: #bc4e2c;
    }

    .proposal-details {
      margin: 16px 0;
      padding: 12px 0;
      border-top: 1px dashed #eef2f8;
      border-bottom: 1px dashed #eef2f8;
    }

    .proposal-message {
      color: #3a5a72;
      line-height: 1.45;
      margin-bottom: 12px;
      background: #fafcff;
      padding: 12px 16px;
      border-radius: 24px;
      font-size: 0.9rem;
    }

    .proposal-value {
      font-weight: 700;
      color: #2c7a6e;
      font-size: 1rem;
      display: inline-block;
      background: #ecfdf5;
      padding: 4px 16px;
      border-radius: 60px;
    }

    .proposal-date {
      font-size: 0.7rem;
      color: #8aa0bc;
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }

    .detail-link {
      color: #2c7a6e;
      font-weight: 700;
      text-decoration: none;
      font-size: 0.85rem;
      transition: 0.2s;
    }

    .detail-link:hover {
      text-decoration: underline;
      color: #f97316;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #8ba0bc;
    }

    .empty-state span {
      font-size: 3rem;
      opacity: 0.6;
    }

    .success-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 40px;
      color: white;
      font-weight: 600;
      z-index: 9999;
      background: #f97316;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: fadeInOut 3s ease forwards;
    }

    .toast-msg {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      background: #1f2e3a;
      color: white;
      padding: 12px 28px;
      border-radius: 60px;
      font-weight: 500;
      z-index: 1100;
      font-size: 0.85rem;
      white-space: nowrap;
    }

    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateX(20px); }
      15% { opacity: 1; transform: translateX(0); }
      85% { opacity: 1; transform: translateX(0); }
      100% { opacity: 0; transform: translateX(20px); visibility: hidden; }
    }

    @media (max-width: 680px) {
      .page-header {
        padding: 24px 24px 20px;
      }
      .header-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      .filters-bar {
        padding: 20px 24px 0;
      }
      .proposals-list {
        padding: 24px 24px 28px;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div
        style={{
          background: 'linear-gradient(135deg, #f0f4fa 0%, #e0e8f2 100%)',
          fontFamily:
            "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          minHeight: '100vh',
          padding: '20px 20px 40px',
          color: '#1e2e3e',
        }}
      >
        <div className="proposals-container">
          <div className="page-header">
            <h1>📋 Propostas</h1>
            <div className="header-row">
              <div className="user-actions">
                <Link to="/professional/home" className="icon-btn" title="Home">
                  <i className="fas fa-home"></i>
                </Link>
                <Link
                  to="/professional/proposals"
                  className="icon-btn"
                  title="Todas as propostas"
                >
                  <i className="fas fa-briefcase"></i>
                </Link>
                <Link
                  to="/professional/profile"
                  className="icon-btn"
                  title="Perfil"
                >
                  <i className="fas fa-user"></i>
                </Link>
                <a
                  href="#"
                  className="icon-btn"
                  id="logoutBtn"
                  title="Sair"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="filters-bar">
            <button
              className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCurrentFilter('all')}
            >
              📌 Todas
            </button>
            <button
              className={`filter-btn ${currentFilter === 'PENDENTE' ? 'active' : ''}`}
              onClick={() => setCurrentFilter('PENDENTE')}
            >
              ⏳ Aguardando resposta
            </button>
            <button
              className={`filter-btn ${currentFilter === 'ACEITA' ? 'active' : ''}`}
              onClick={() => setCurrentFilter('ACEITA')}
            >
              ✅ Aceitas
            </button>
            <button
              className={`filter-btn ${currentFilter === 'RECUSADA' ? 'active' : ''}`}
              onClick={() => setCurrentFilter('RECUSADA')}
            >
              ❌ Recusadas
            </button>
          </div>

          <div className="proposals-list">{renderPropostas()}</div>
        </div>
      </div>

      {toastMessage && (
        <div
          className={toastType === 'success' ? 'success-toast' : 'toast-msg'}
          style={
            toastType === 'success'
              ? { background: '#f97316' }
              : {
                  background: toastMessage.includes('📬')
                    ? '#2c5a6e'
                    : '#1f2e3a',
                }
          }
        >
          {toastMessage}
        </div>
      )}

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

export default Proposals;
