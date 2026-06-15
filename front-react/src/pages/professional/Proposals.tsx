import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  listarMinhasPropostasProfissional,
  marcarServicoComoConcluido,
  criarAvaliacaoProfissional,
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

type FiltroProposta =
  | 'all'
  | 'PENDENTE'
  | 'ACEITA'
  | 'RECUSADA'
  | 'FINALIZADA'
  | 'EM_ANDAMENTO';

const Proposals: React.FC = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const [propostas, setPropostas] = useState<any[]>([]);
  const [currentFilter, setCurrentFilter] = useState<FiltroProposta>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'normal'>(
    'normal'
  );
  const [loading, setLoading] = useState(true);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [rating, setRating] = useState({
    estrelas_trabalho: 5,
    estrelas_tempo_execucao: 5,
    estrelas_tempo_resposta: 5,
    comentario: '',
  });

  const loadPropostas = async () => {
    try {
      setLoading(true);
      const dados = await listarMinhasPropostasProfissional();
      setPropostas(dados.propostas || []);
    } catch (error) {
      console.error(error);
      const mensagem =
        error instanceof Error ? error.message : 'Erro ao carregar propostas!';
      setToastMessage(mensagem);
      setToastType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarConcluido = async (propostaId: number) => {
    try {
      await marcarServicoComoConcluido(propostaId);
      setToastMessage('✅ Serviço marcado como concluído!');
      setToastType('success');
      await loadPropostas();
    } catch (error) {
      console.error(error);
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Erro ao marcar serviço como concluído!';
      setToastMessage(mensagem);
      setToastType('error');
    }
  };

  const openRatingModal = (proposta: any) => {
    setSelectedProposal(proposta);
    setRating({
      estrelas_trabalho: 5,
      estrelas_tempo_execucao: 5,
      estrelas_tempo_resposta: 5,
      comentario: '',
    });
    setRatingModalOpen(true);
  };

  const closeRatingModal = () => {
    setRatingModalOpen(false);
    setSelectedProposal(null);
  };

  const handleSubmitRating = async () => {
    if (!selectedProposal) return;
    try {
      await criarAvaliacaoProfissional({
        proposal_professional_id: selectedProposal.id,
        estrelas_trabalho: rating.estrelas_trabalho,
        estrelas_tempo_execucao: rating.estrelas_tempo_execucao,
        estrelas_tempo_resposta: rating.estrelas_tempo_resposta,
        comentario: rating.comentario,
      });
      setToastMessage('Avaliação do cliente criada com sucesso!');
      setToastType('success');
      await loadPropostas();
      closeRatingModal();
    } catch (error) {
      console.error(error);
      const mensagem = error instanceof Error ? error.message : 'Erro ao avaliar cliente';
      setToastMessage(mensagem);
      setToastType('error');
    }
  };

  const filteredPropostas = propostas.filter((proposta) => {
    if (currentFilter === 'all') return true;
    return proposta.status === currentFilter;
  });

  const formatarValor = (valor: number | null) => {
    if (!valor) return 'A negociar';
    return `R$ ${Number(valor).toFixed(2)}`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return { bg: '#fff3e0', color: '#c96f0e', text: '⏳ Aguardando' };
      case 'ACEITA':
      case 'EM_ANDAMENTO':
        return { bg: '#dcfce7', color: '#16a34a', text: '✅ Em andamento' };
      case 'RECUSADA':
        return { bg: '#fee2e2', color: '#dc2626', text: '❌ Recusada' };
      case 'FINALIZADA':
        return { bg: '#dbeafe', color: '#2563eb', text: '✅ Concluída' };
      default:
        return { bg: '#f3f4f6', color: '#64748b', text: status };
    }
  };

  const renderPropostas = (): React.ReactNode => {
    if (loading) {
      return (
        <div className="empty-state">
          <span>⏳</span>
          <p style={{ marginTop: '12px', fontSize: '1.1rem' }}>
            Carregando suas propostas...
          </p>
        </div>
      );
    }

    if (filteredPropostas.length === 0) {
      return (
        <div className="empty-state">
          <span>📭</span>
          <p style={{ marginTop: '12px', fontSize: '1.1rem' }}>
            Você ainda não tem nenhuma proposta!
          </p>
          <p style={{ marginTop: '8px', color: '#9a3412' }}>
            Volte para home e envie sua primeira proposta!
          </p>
        </div>
      );
    }

    return (
      <>
        {filteredPropostas.map((proposta) => {
          const statusStyle = getStatusStyle(proposta.status);
          return (
            <div
              className="proposal-card"
              key={proposta.id}
              data-id={proposta.id}
            >
              <div className="card-header">
                <div className="client-info">
                  <h3>{proposta.servico?.titulo || 'Serviço'}</h3>
                  <div className="service-tag">
                    👤 {proposta.cliente?.nome || 'Cliente'}
                    {proposta.servico?.localizacao &&
                      ` · 📍 ${proposta.servico.localizacao}`}
                  </div>
                </div>
                <div
                  className="status-badge"
                  style={{
                    background: statusStyle.bg,
                    color: statusStyle.color,
                  }}
                >
                  {statusStyle.text}
                </div>
              </div>
              <div className="proposal-details">
                {proposta.mensagem && (
                  <div className="proposal-message">
                    <strong>💬 Sua mensagem:</strong>
                    <br />
                    {proposta.mensagem.length > 160
                      ? proposta.mensagem.substring(0, 160) + '...'
                      : proposta.mensagem}
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginTop: '12px',
                  }}
                >
                  <span className="proposal-value">
                    💰 {formatarValor(proposta.valor)}
                    {proposta.negociavel === 1 && ' (negociável)'}
                  </span>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      background: '#fff7ed',
                      padding: '6px 14px',
                      borderRadius: '60px',
                      color: '#9a3412',
                      fontWeight: '600',
                    }}
                  >
                    📅{' '}
                    {new Date(proposta.created_at).toLocaleDateString('pt-BR')}{' '}
                    às{' '}
                    {new Date(proposta.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
              <div className="proposal-date">
                <span style={{ color: '#c2410c', fontWeight: '600' }}>
                  📨 Proposta #{proposta.id}
                </span>
                <div
                  style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
                >
                  {(proposta.status === 'ACEITA' ||
                    proposta.status === 'EM_ANDAMENTO') && (
                    <button
                      style={{
                        padding: '10px 22px',
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '60px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 12px rgba(249,115,22,0.2)',
                      }}
                      onClick={() => handleMarcarConcluido(proposta.id)}
                      onMouseOver={(e) =>
                        ((e.target as HTMLButtonElement).style.transform =
                          'translateY(-1px)')
                      }
                      onMouseOut={(e) =>
                        ((e.target as HTMLButtonElement).style.transform =
                          'translateY(0)')
                      }
                    >
                      ✅ Marcar como Concluído
                    </button>
                  )}
                  {proposta.status === 'FINALIZADA' && (
                    <button
                      style={{
                        padding: '10px 22px',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        border: 'none',
                        borderRadius: '60px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.1)',
                      }}
                      onClick={() => openRatingModal(proposta)}
                    >
                      ⭐ Avaliar Cliente
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  useEffect(() => {
    loadPropostas();
  }, []);

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
    body { background: #fff7ed; min-height: 100vh; }
    .proposals-container { max-width: 1000px; margin: 0 auto; background: white; border-radius: 40px; box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.12); overflow: hidden; margin-top: 32px; }
    .page-header { background: linear-gradient(115deg, #f97316, #ea580c); padding: 32px 36px 26px; color: white; }
    .page-header h1 { font-size: 2rem; font-weight: 800; letter-spacing: -0.3px; margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
    .header-row { display: flex; align-items: center; justify-content: flex-start; gap: 20px; flex-wrap: wrap; }
    .user-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .icon-btn { width: 44px; height: 44px; border: none; border-radius: 12px; background: rgba(255,255,255,0.18); color: white; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; transition: 0.2s; }
    .icon-btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-1px); }
    .page-header p { opacity: 0.95; font-weight: 500; font-size: 0.95rem; }
    .filters-bar { padding: 24px 36px 0; display: flex; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid #fed7aa; }
    .filter-btn { background: transparent; border: none; padding: 10px 20px; font-weight: 700; font-size: 0.9rem; border-radius: 60px; cursor: pointer; transition: all 0.2s; color: #9a3412; }
    .filter-btn.active { background: linear-gradient(135deg, #f97316, #ea580c); color: white; box-shadow: 0 4px 12px rgba(249,115,22,0.25); }
    .filter-btn:hover:not(.active) { background: #fff7ed; color: #c2410c; }
    .proposals-list { padding: 28px 36px 36px; min-height: 360px; }
    .proposal-card { background: white; border: 1px solid #ffe4c2; border-radius: 28px; padding: 26px; margin-bottom: 20px; transition: all 0.25s; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03); }
    .proposal-card:hover { transform: translateY(-3px); box-shadow: 0 12px 24px -10px rgba(249, 115, 22, 0.15); border-color: #fdba74; }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; margin-bottom: 18px; }
    .client-info h3 { font-size: 1.3rem; font-weight: 800; color: #7c2d12; }
    .service-tag { background: #fff7ed; padding: 6px 14px; border-radius: 60px; font-size: 0.85rem; font-weight: 600; color: #c2410c; display: inline-block; margin-top: 8px; }
    .status-badge { padding: 8px 18px; border-radius: 60px; font-weight: 800; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.4px; }
    .proposal-details { margin: 18px 0; padding: 16px 0; border-top: 1px dashed #ffe4c2; border-bottom: 1px dashed #ffe4c2; }
    .proposal-message { color: #7c2d12; line-height: 1.6; margin-bottom: 14px; background: #fffbeb; padding: 14px 18px; border-radius: 20px; font-size: 0.95rem; }
    .proposal-value { font-weight: 800; color: #16a34a; font-size: 1.05rem; display: inline-block; background: #ecfdf5; padding: 6px 16px; border-radius: 60px; }
    .proposal-date { font-size: 0.85rem; color: #c2410c; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
    .empty-state { text-align: center; padding: 70px 20px; color: #9a3412; }
    .empty-state span { font-size: 4rem; opacity: 0.7; display: block; margin-bottom: 10px; }
    .success-toast { position: fixed; top: 24px; right: 24px; padding: 14px 24px; border-radius: 60px; color: white; font-weight: 700; z-index: 9999; background: linear-gradient(135deg, #f97316, #ea580c); box-shadow: 0 4px 14px rgba(249,115,22,0.25); animation: fadeInOut 3s ease forwards; }
    .error-toast { background: #dc2626 !important; box-shadow: 0 4px 14px rgba(220,38,38,0.25) !important; }

    /* Modal de Avaliação */
    .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: none; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal.active { display: flex; }
    .modal-content { background: white; border-radius: 28px; max-width: 520px; width: 100%; max-height: 88vh; overflow: auto; animation: modalFade 0.3s ease; }
    .modal-header { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; padding: 1.3rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-radius: 28px 28px 0 0; }
    .modal-header h3 { font-size: 1.25rem; font-weight: 700; }
    .close-modal { background: rgba(255,255,255,0.15); border: none; color: white; font-size: 1.5rem; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; }
    .modal-body { padding: 1.5rem; color: #334155; line-height: 1.7; }
    .stars-container { display: flex; gap: 0.5rem; justify-content: center; }
    .star { font-size: 2.2rem; color: #d1d5db; cursor: pointer; transition: 0.2s; }
    .star.filled { color: #f59e0b; }
    .star:hover { transform: scale(1.1); }
    .rating-input { width: 100%; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 16px; font-size: 1rem; min-height: 100px; resize: vertical; margin-top: 0.5rem; font-family: inherit; }
    .rating-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
    .btn-rating-submit { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; border: none; padding: 0.9rem 1.8rem; border-radius: 16px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: 0.3s; }
    .btn-rating-cancel { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; padding: 0.9rem 1.8rem; border-radius: 16px; font-weight: 700; font-size: 1rem; cursor: pointer; }
    @keyframes modalFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 700px) {
      .page-header { padding: 24px 20px 18px; }
      .filters-bar { padding: 20px 20px 0; }
      .proposals-list { padding: 24px 20px 32px; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div
        style={{
          background: '#fff7ed',
          minHeight: '100vh',
          paddingBottom: '40px',
        }}
      >
        <div className="proposals-container">
          <div className="page-header">
            <h1>
              <i className="fas fa-file-contract"></i> Minhas Propostas
            </h1>
            <div className="header-row">
              <div className="user-actions">
                <Link
                  to="/professional/home"
                  className="icon-btn"
                  title="Voltar para Home"
                >
                  <i className="fas fa-home"></i>
                </Link>
                <Link
                  to="/professional/profile"
                  className="icon-btn"
                  title="Meu Perfil"
                >
                  <i className="fas fa-user"></i>
                </Link>
                <button
                  className="icon-btn"
                  id="logoutBtn"
                  title="Sair"
                  onClick={async (e) => {
                    e.preventDefault();
                    if (window.confirm('Deseja realmente sair da sua conta?')) {
                      await logout();
                      setToastMessage('🔐 Logout realizado com sucesso!');
                      setToastType('success');
                      setTimeout(() => {
                        navigate('/');
                      }, 1000);
                    }
                  }}
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
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
              ⏳ Aguardando
            </button>
            <button
              className={`filter-btn ${currentFilter === 'ACEITA' ? 'active' : ''}`}
              onClick={() => setCurrentFilter('ACEITA')}
            >
              ✅ Aceitas
            </button>
            <button
              className={`filter-btn ${currentFilter === 'EM_ANDAMENTO' ? 'active' : ''}`}
              onClick={() => setCurrentFilter('EM_ANDAMENTO')}
            >
              🔧 Em andamento
            </button>
            <button
              className={`filter-btn ${currentFilter === 'FINALIZADA' ? 'active' : ''}`}
              onClick={() => setCurrentFilter('FINALIZADA')}
            >
              ✅ Concluídas
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
          className={`success-toast ${toastType === 'error' ? 'error-toast' : ''}`}
          style={toastType === 'normal' ? { background: '#7c2d12' } : undefined}
        >
          {toastMessage}
        </div>
      )}

      {/* Modal de Avaliação do Cliente */}
      <div className={`modal ${ratingModalOpen ? 'active' : ''}`} onClick={closeRatingModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Avaliar Cliente</h3>
            <button className="close-modal" onClick={closeRatingModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            {selectedProposal && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Avaliando o cliente do serviço: <br/>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      {selectedProposal.servico?.titulo}
                    </span>
                  </p>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#334155' }}>
                    Comunicação e Clareza
                  </label>
                  <div className="stars-container" style={{ marginBottom: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={`trab-${star}`}
                        className={`fas fa-star star ${star <= rating.estrelas_trabalho ? 'filled' : ''}`}
                        onClick={() => setRating((prev) => ({ ...prev, estrelas_trabalho: star }))}
                      ></i>
                    ))}
                  </div>

                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#334155' }}>
                    Cumprimento de Acordos
                  </label>
                  <div className="stars-container" style={{ marginBottom: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={`exec-${star}`}
                        className={`fas fa-star star ${star <= rating.estrelas_tempo_execucao ? 'filled' : ''}`}
                        onClick={() => setRating((prev) => ({ ...prev, estrelas_tempo_execucao: star }))}
                      ></i>
                    ))}
                  </div>

                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#334155' }}>
                    Tempo de Resposta
                  </label>
                  <div className="stars-container" style={{ marginBottom: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={`resp-${star}`}
                        className={`fas fa-star star ${star <= rating.estrelas_tempo_resposta ? 'filled' : ''}`}
                        onClick={() => setRating((prev) => ({ ...prev, estrelas_tempo_resposta: star }))}
                      ></i>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
                    Comentário (opcional)
                  </label>
                  <textarea
                    className="rating-input"
                    placeholder="Descreva como foi trabalhar com este cliente..."
                    value={rating.comentario}
                    onChange={(e) => setRating((prev) => ({ ...prev, comentario: e.target.value }))}
                  />
                </div>
                <div className="rating-actions">
                  <button className="btn-rating-cancel" onClick={closeRatingModal}>
                    Cancelar
                  </button>
                  <button className="btn-rating-submit" onClick={handleSubmitRating}>
                    Enviar Avaliação
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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

export default Proposals;
