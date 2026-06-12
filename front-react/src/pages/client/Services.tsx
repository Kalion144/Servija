import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  listarMeusServicos,
  listarPropostasRecebidas,
  criarAvaliacao,
} from '../../services/api';
import { getUserCity } from '../../lib/userLocation';
import CitySearchBar from '../../components/CitySearchBar';

const Services = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [servicos, setServicos] = useState([]);
  const [propostas, setPropostas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [rating, setRating] = useState({
    estrelas_trabalho: 5,
    estrelas_tempo_execucao: 5,
    estrelas_tempo_resposta: 5,
    comentario: '',
  });
  const [cidadeInput, setCidadeInput] = useState('');
  const [cidadeFiltro, setCidadeFiltro] = useState('');
  const toastTimeoutRef = useRef(null);

  const showToast = (msg, isError = false) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({ msg, isError });
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    carregarServicos();
    carregarPropostas();
  }, []);

  const minhaCidade = getUserCity(usuario);

  const carregarServicos = async (cidade?: string) => {
    try {
      const dados = await listarMeusServicos(
        cidade ? { cidade, busca: cidade } : undefined,
      );
      if (dados.servicos) setServicos(dados.servicos);
    } catch (error) {
      console.error(error);
    }
  };

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

  const carregarPropostas = async () => {
    try {
      const dados = await listarPropostasRecebidas();
      if (dados.propostas) setPropostas(dados.propostas);
    } catch (error) {
      console.error(error);
    }
  };

  const openServiceModal = (servico) => {
    if (servico.fotos && typeof servico.fotos === 'string') {
      try {
        servico.fotos = JSON.parse(servico.fotos);
      } catch (e) {
        servico.fotos = [];
      }
    }
    setSelectedService(servico);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedService(null);
  };

  const openRatingModal = (proposta) => {
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
      await criarAvaliacao({
        proposal_professional_id: selectedProposal.id,
        estrelas_trabalho: rating.estrelas_trabalho,
        estrelas_tempo_execucao: rating.estrelas_tempo_execucao,
        estrelas_tempo_resposta: rating.estrelas_tempo_resposta,
        comentario: rating.comentario,
      });
      showToast('Avaliação criada com sucesso!');
      await carregarServicos();
      await carregarPropostas();
      closeRatingModal();
    } catch (error) {
      console.error(error);
      showToast('Erro ao criar avaliação', true);
    }
  };

  const formatarValor = (valor) => {
    if (!valor) return '—';
    return `R$ ${Number(valor).toFixed(2)}`;
  };

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f0f4fa; font-family: 'Inter', sans-serif; padding: 1.5rem; color: #1e2e3e; }
    .services-container { max-width: 1300px; margin: 0 auto; }
    .user-header { background: white; border-radius: 28px; padding: 1.5rem 2rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; box-shadow: 0 2px 16px rgba(0,0,0,0.06); border: 1px solid #e6eef8; }
    .user-info h2 { font-size: 1.7rem; font-weight: 700; color: #0f172a; margin-bottom: 0.4rem; }
    .user-info p { color: #64748b; font-size: 0.95rem; }
    .user-actions { display: flex; gap: 0.8rem; }
    .icon-btn { background: #f0f4fa; border: none; width: 48px; height: 48px; border-radius: 50%; cursor: pointer; font-size: 1rem; color: #475569; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
    .icon-btn:hover { background: #3b82f6; color: white; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2); }
    .main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 1.5rem; }
    .section-card { background: white; border-radius: 28px; padding: 1.75rem; margin-bottom: 1.5rem; border: 1px solid #e6eef8; box-shadow: 0 2px 16px rgba(0,0,0,0.04); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.8rem; }
    .section-header h3 { font-size: 1.4rem; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 0.6rem; }
    .update-btn { border: none; background: #3b82f6; color: white; padding: 0.7rem 1.2rem; border-radius: 28px; cursor: pointer; font-weight: 600; transition: 0.3s; display: flex; align-items: center; gap: 0.4rem; }
    .update-btn:hover { background: #2563eb; transform: translateY(-2px); }
    .progress-section { margin-bottom: 1.5rem; }
    .progress-label { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem; color: #475569; font-weight: 600; }
    .progress-bar { background: #e2e8f0; border-radius: 28px; height: 10px; overflow: hidden; }
    .progress-fill { background: linear-gradient(90deg, #3b82f6, #60a5fa); height: 100%; border-radius: 28px; }
    .status-badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.85rem; border-radius: 28px; font-size: 0.78rem; font-weight: 700; }
    .status-pendente { background: #dbeafe; color: #1d4ed8; }
    .service-card { background: white; border-radius: 24px; padding: 1.25rem; margin-bottom: 1rem; border: 1px solid #e6eef8; cursor: pointer; transition: 0.3s; }
    .service-card:hover { border-color: #3b82f6; transform: translateX(4px); box-shadow: 0 10px 24px rgba(59,130,246,0.08); }
    .service-title { font-weight: 700; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.8rem; color: #0f172a; font-size: 1.1rem; }
    .service-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; font-size: 0.9rem; color: #64748b; padding-top: 0.9rem; border-top: 1px solid #f0f4fa; }
    .category-badge { background: #eff6ff; color: #1d4ed8; padding: 0.3rem 0.7rem; border-radius: 28px; font-size: 0.78rem; font-weight: 600; }
    .create-btn { width: 100%; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 1rem; border: none; border-radius: 28px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 1rem; font-size: 1rem; transition: 0.3s; }
    .create-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(59,130,246,0.25); }
    .create-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: none; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal.active { display: flex; }
    .modal-content { background: white; border-radius: 28px; max-width: 520px; width: 100%; max-height: 88vh; overflow: auto; animation: modalFade 0.3s ease; }
    .modal-header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 1.3rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-radius: 28px 28px 0 0; }
    .modal-header h3 { font-size: 1.25rem; font-weight: 700; }
    .close-modal { background: rgba(255,255,255,0.15); border: none; color: white; font-size: 1.5rem; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; }
    .modal-body { padding: 1.5rem; color: #334155; line-height: 1.7; }
    .success-toast { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); background: #16a34a; color: white; padding: 0.9rem 1.8rem; border-radius: 28px; z-index: 1000; font-weight: 600; box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
    .error-toast { background: #dc2626; }
    .image-preview { margin-top: 1rem; display: flex; gap: 0.7rem; flex-wrap: wrap; }
    .preview-img { width: 80px; height: 80px; object-fit: cover; border-radius: 12px; border: 1px solid #e2e8f0; }
    .rating-btn { background: #f97316; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 20px; font-weight: 600; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 0.4rem; }
    .rating-btn:hover { background: #ea580c; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); }
    .rating-modal-header { background: linear-gradient(135deg, #f97316, #ea580c); }
    .stars-container { display: flex; gap: 0.5rem; margin-bottom: 1rem; justify-content: center; }
    .star { font-size: 2.5rem; color: #d1d5db; cursor: pointer; transition: 0.2s; }
    .star.filled { color: #f59e0b; }
    .star:hover { transform: scale(1.1); }
    .rating-input { width: 100%; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 16px; font-size: 1rem; min-height: 100px; resize: vertical; margin-top: 0.5rem; font-family: inherit; }
    .rating-input:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1); }
    .rating-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
    .btn-rating-submit { background: linear-gradient(135deg, #f97316, #ea580c); color: white; border: none; padding: 0.9rem 1.8rem; border-radius: 16px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: 0.3s; }
    .btn-rating-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(249, 115, 22, 0.3); }
    .btn-rating-cancel { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; padding: 0.9rem 1.8rem; border-radius: 16px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: 0.3s; }
    .btn-rating-cancel:hover { background: #fca5a5; color: #fff; }
    .rating-display { background: #fff7ed; padding: 1rem; border-radius: 16px; margin-top: 0.8rem; border: 1px solid #fed7aa; }
    .rating-display-header { display: flex; gap: 0.35rem; color: #7c2d12; font-weight: 600; margin-bottom: 0.5rem; }
    .rating-stars { color: #f59e0b; }
    @keyframes modalFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 900px) { .main-grid { grid-template-columns: 1fr; } .user-header { flex-direction: column; align-items: flex-start; } }
  `;

  const canCreateNew = servicos.length < 3;

  return (
    <>
      <style>{styles}</style>
      <div className="services-container">
        <div className="user-header">
          <div className="user-info">
            <h2>Olá, {usuario?.nome?.split(' ')[0] || 'Cliente'}</h2>
            <p>
              Gerencie seus serviços{' '}
              {!canCreateNew && (
                <span style={{ color: '#dc2626', fontWeight: 600 }}>
                  (limite de 3 atingido)
                </span>
              )}
            </p>
          </div>
          <div className="user-actions">
            <button
              className="icon-btn"
              onClick={() => navigate('/client/home')}
              title="Home"
            >
              <i className="fas fa-home"></i>
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
          <div className="left-column">
            <div className="section-card">
              <div className="section-header">
                <h3>
                  <i className="fas fa-clipboard-list"></i> Meus Serviços
                </h3>
                <button className="update-btn" onClick={() => carregarServicos(cidadeFiltro || undefined)}>
                  <i className="fas fa-sync-alt"></i> Atualizar
                </button>
              </div>
              <CitySearchBar
                value={cidadeInput}
                onChange={setCidadeInput}
                onSearch={handleBuscarCidade}
                onClear={handleLimparCidade}
                onUseMyCity={minhaCidade ? handleUsarMinhaCidade : undefined}
                myCityLabel={minhaCidade ? `Minha cidade (${minhaCidade})` : undefined}
                accentColor="#2563eb"
                placeholder="Filtrar meus serviços por cidade..."
              />
              {cidadeFiltro && (
                <p className="city-filter-active">
                  Filtrando por: <strong>{cidadeFiltro}</strong>
                </p>
              )}
              <div className="progress-section">
                <div className="progress-label">
                  <span>Ativos</span>
                  <span>{servicos.length}/3</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((servicos.length / 3) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              {servicos.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#64748b',
                  }}
                >
                  <i
                    className="fas fa-inbox"
                    style={{ fontSize: '3.5rem', marginBottom: '1rem' }}
                  ></i>
                  <p style={{ fontSize: '1.1rem' }}>
                    Você ainda não tem serviços abertos
                  </p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>
                    Crie um novo para começar!
                  </p>
                </div>
              ) : (
                servicos.map((servico) => {
                  const serviceProposals = propostas.filter(
                    (p) => p.service_id === servico.id
                  );
                  const finalProposal = serviceProposals.find(
                    (p) => p.status === 'FINALIZADA' || p.status === 'AVALIADA'
                  );
                  const hasRating = finalProposal?.avaliacao;

                  return (
                    <div
                      key={servico.id}
                      className="service-card"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('.rating-btn')) {
                          e.stopPropagation();
                          return;
                        }
                        openServiceModal(servico);
                      }}
                    >
                      <div className="service-title">
                        <span>{servico.titulo}</span>
                        <span
                          className="status-badge"
                          style={{
                            background:
                              servico.status === 'FINALIZADA' ||
                              servico.status === 'AVALIADA'
                                ? '#ede9fe'
                                : servico.status === 'EM_ANDAMENTO'
                                  ? '#dbeafe'
                                  : '#f3f4f6',
                            color:
                              servico.status === 'FINALIZADA' ||
                              servico.status === 'AVALIADA'
                                ? '#7c3aed'
                                : servico.status === 'EM_ANDAMENTO'
                                  ? '#1d4ed8'
                                  : '#6b7280',
                          }}
                        >
                          <i
                            className={`fas ${
                              servico.status === 'FINALIZADA'
                                ? 'fa-flag-checkered'
                                : servico.status === 'AVALIADA'
                                  ? 'fa-star'
                                  : servico.status === 'EM_ANDAMENTO'
                                    ? 'fa-spinner'
                                    : 'fa-clock'
                            }`}
                          ></i>{' '}
                          {servico.status === 'PENDENTE'
                            ? 'Pendente'
                            : servico.status === 'FINALIZADA'
                              ? 'Finalizado'
                              : servico.status === 'AVALIADA'
                                ? 'Avaliado'
                                : servico.status}
                        </span>
                      </div>
                      {servico.categoria && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <span className="category-badge">
                            {servico.categoria}
                          </span>
                        </div>
                      )}
                      {servico.localizacao && (
                        <div
                          style={{
                            fontSize: '0.9rem',
                            color: '#64748b',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <i className="fas fa-map-marker-alt"></i>{' '}
                          {servico.localizacao}
                        </div>
                      )}
                      {/* Show professional data if available */}
                      {finalProposal?.profissional && (
                        <div
                          style={{
                            marginBottom: '0.8rem',
                            padding: '0.8rem',
                            background: '#f8fafc',
                            borderRadius: '16px',
                            fontSize: '0.9rem',
                          }}
                        >
                          <p
                            style={{ marginBottom: '0.4rem', color: '#334155' }}
                          >
                            <strong>Profissional: </strong>
                            {finalProposal.profissional.nome}
                          </p>
                          {finalProposal.profissional.profissao && (
                            <p
                              style={{
                                color: '#475569',
                                marginBottom: '0.25rem',
                              }}
                            >
                              {finalProposal.profissional.profissao}
                            </p>
                          )}
                          {finalProposal.profissional.media_estrelas && (
                            <p style={{ color: '#f59e0b' }}>
                              <i className="fas fa-star"></i>{' '}
                              {finalProposal.profissional.media_estrelas}
                              {finalProposal.profissional.total_avaliacoes && (
                                <span
                                  style={{
                                    color: '#64748b',
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  ({finalProposal.profissional.total_avaliacoes}{' '}
                                  avaliações)
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      )}
                      {/* Show rating if available */}
                      {hasRating && (
                        <div className="rating-display">
                          <div className="rating-display-header">
                            <i className="fas fa-star"></i> Sua Avaliação
                          </div>
                          <div style={{ marginBottom: '0.4rem' }}>
                            <span className="rating-stars">
                              {'★'.repeat(Number(hasRating.estrelas))}
                              {'☆'.repeat(5 - Number(hasRating.estrelas))}
                            </span>
                          </div>
                          {hasRating.comentario && (
                            <p
                              style={{
                                color: '#7c2d12',
                                fontSize: '0.9rem',
                                fontStyle: 'italic',
                              }}
                            >
                              "{hasRating.comentario}"
                            </p>
                          )}
                        </div>
                      )}
                      <div className="service-footer">
                        <span>
                          <i className="fas fa-dollar-sign"></i>{' '}
                          {formatarValor(servico.preco)}
                        </span>
                        {finalProposal &&
                          servico.status === 'FINALIZADA' &&
                          !hasRating && (
                            <button
                              className="rating-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                openRatingModal(finalProposal);
                              }}
                            >
                              <i className="fas fa-star"></i> Avaliar
                            </button>
                          )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="right-column">
            <div className="section-card">
              <div className="section-header">
                <h3>
                  <i className="fas fa-plus-circle"></i> Ação Rápida
                </h3>
              </div>
              <button
                className="create-btn"
                onClick={() => navigate('/client/post-service')}
                disabled={!canCreateNew}
              >
                <i className="fas fa-plus"></i> Novo Serviço
              </button>
              {!canCreateNew && (
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: '#64748b',
                    marginTop: '0.8rem',
                    textAlign: 'center',
                  }}
                >
                  Para criar mais serviços, finalize ou cancele um existente
                </p>
              )}
            </div>
            <div className="section-card">
              <div className="section-header">
                <h3>
                  <i className="fas fa-lightbulb"></i> Dicas
                </h3>
              </div>
              <div
                style={{
                  color: '#475569',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                }}
              >
                <p style={{ marginBottom: '0.7rem' }}>
                  • Seja específico na descrição
                </p>
                <p style={{ marginBottom: '0.7rem' }}>
                  • Adicione fotos para atrair mais profissionais
                </p>
                <p>
                  • Respondendo propostas rápido aumenta as chances de encontrar
                  o profissional ideal
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Modal */}
        <div
          className={`modal ${modalOpen ? 'active' : ''}`}
          onClick={closeModal}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalhes do Serviço</h3>
              <button className="close-modal" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {selectedService &&
                (() => {
                  const statusConfig = {
                    PENDENTE: {
                      label: 'Pendente',
                      color: '#1d4ed8',
                      bg: '#dbeafe',
                      icon: 'fa-clock',
                    },
                    ACEITA: {
                      label: 'Aceita',
                      color: '#16a34a',
                      bg: '#dcfce7',
                      icon: 'fa-check-circle',
                    },
                    RECUSADA: {
                      label: 'Recusada',
                      color: '#dc2626',
                      bg: '#fee2e2',
                      icon: 'fa-times-circle',
                    },
                    EM_ANDAMENTO: {
                      label: 'Em andamento',
                      color: '#2563eb',
                      bg: '#dbeafe',
                      icon: 'fa-spinner',
                    },
                    FINALIZADA: {
                      label: 'Finalizado',
                      color: '#7c3aed',
                      bg: '#ede9fe',
                      icon: 'fa-flag-checkered',
                    },
                    AVALIADA: {
                      label: 'Avaliado',
                      color: '#0891b2',
                      bg: '#cffafe',
                      icon: 'fa-star',
                    },
                    CANCELADA: {
                      label: 'Cancelado',
                      color: '#6b7280',
                      bg: '#f3f4f6',
                      icon: 'fa-ban',
                    },
                  };
                  const s = statusConfig[selectedService.status] ?? {
                    label: selectedService.status,
                    color: '#6b7280',
                    bg: '#f3f4f6',
                    icon: 'fa-circle',
                  };
                  return (
                    <>
                      <div style={{ marginBottom: '1.1rem' }}>
                        <h2
                          style={{
                            fontSize: '1.4rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            marginBottom: '0.5rem',
                          }}
                        >
                          {selectedService.titulo}
                        </h2>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: s.bg,
                            color: s.color,
                            padding: '0.3rem 0.85rem',
                            borderRadius: '28px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                          }}
                        >
                          <i className={`fas ${s.icon}`}></i> {s.label}
                        </span>
                      </div>

                      {selectedService.categoria && (
                        <div style={{ marginBottom: '0.8rem' }}>
                          <span className="category-badge">
                            {selectedService.categoria}
                          </span>
                          {selectedService.urgente === 1 && (
                            <span
                              style={{
                                marginLeft: '0.5rem',
                                background: '#fee2e2',
                                color: '#dc2626',
                                padding: '0.3rem 0.7rem',
                                borderRadius: '28px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                              }}
                            >
                              🚨 Urgente
                            </span>
                          )}
                        </div>
                      )}

                      {selectedService.descricao && (
                        <div
                          style={{
                            background: '#f8fafc',
                            borderRadius: '18px',
                            padding: '1rem 1.1rem',
                            marginBottom: '1.2rem',
                            color: '#475569',
                            fontSize: '0.95rem',
                            lineHeight: '1.6',
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              marginBottom: '0.35rem',
                              color: '#1e293b',
                            }}
                          >
                            Descrição
                          </div>
                          {selectedService.descricao}
                        </div>
                      )}

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '0.8rem',
                          marginBottom: '1.2rem',
                        }}
                      >
                        <div
                          style={{
                            background: '#f8fafc',
                            borderRadius: '18px',
                            padding: '0.85rem 1rem',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.78rem',
                              color: '#94a3b8',
                              fontWeight: 600,
                              marginBottom: '0.25rem',
                            }}
                          >
                            <i
                              className="fas fa-dollar-sign"
                              style={{ color: '#3b82f6' }}
                            ></i>{' '}
                            Valor Sugerido
                          </div>
                          <div
                            style={{
                              fontSize: '1.1rem',
                              fontWeight: 700,
                              color: '#3b82f6',
                            }}
                          >
                            {formatarValor(selectedService.preco)}
                          </div>
                        </div>
                        {selectedService.localizacao && (
                          <div
                            style={{
                              background: '#f8fafc',
                              borderRadius: '18px',
                              padding: '0.85rem 1rem',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '0.78rem',
                                color: '#94a3b8',
                                fontWeight: 600,
                                marginBottom: '0.25rem',
                              }}
                            >
                              <i
                                className="fas fa-map-marker-alt"
                                style={{ color: '#3b82f6' }}
                              ></i>{' '}
                              Localização
                            </div>
                            <div
                              style={{
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                color: '#334155',
                              }}
                            >
                              {selectedService.localizacao}
                            </div>
                          </div>
                        )}
                      </div>

                      {selectedService.contato && (
                        <div style={{ marginBottom: '1.2rem' }}>
                          <div
                            style={{
                              fontSize: '0.78rem',
                              color: '#94a3b8',
                              fontWeight: 600,
                              marginBottom: '0.3rem',
                            }}
                          >
                            <i className="fas fa-phone-alt"></i> Contato
                          </div>
                          <div
                            style={{
                              fontSize: '0.95rem',
                              color: '#334155',
                              fontWeight: 600,
                            }}
                          >
                            {selectedService.contato}
                          </div>
                        </div>
                      )}

                      {selectedService.fotos &&
                        selectedService.fotos.length > 0 && (
                          <div>
                            <div
                              style={{
                                fontSize: '0.78rem',
                                color: '#94a3b8',
                                fontWeight: 600,
                                marginBottom: '0.5rem',
                              }}
                            >
                              <i className="fas fa-images"></i> Fotos
                            </div>
                            <div className="image-preview">
                              {selectedService.fotos.map((foto, idx) => (
                                <img
                                  key={idx}
                                  src={
                                    foto.startsWith('http')
                                      ? foto
                                      : `http://localhost:3000${foto}`
                                  }
                                  alt={`Foto ${idx + 1}`}
                                  className="preview-img"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                    </>
                  );
                })()}
            </div>
          </div>
        </div>
        {/* Rating Modal */}
        <div
          className={`modal ${ratingModalOpen ? 'active' : ''}`}
          onClick={closeRatingModal}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header rating-modal-header">
              <h3>Avaliar Profissional</h3>
              <button className="close-modal" onClick={closeRatingModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {selectedProposal && (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <p
                      style={{
                        color: '#64748b',
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Avaliando:{' '}
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>
                        {selectedProposal.profissional?.nome}
                      </span>
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      Serviço: {selectedProposal.servico?.titulo}
                    </p>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#334155' }}>
                      Qualidade do Trabalho
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
                      Tempo de Execução
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
                    <label
                      style={{
                        display: 'block',
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Comentário (opcional)
                    </label>
                    <textarea
                      className="rating-input"
                      placeholder="Descreva sua experiência..."
                      value={rating.comentario}
                      onChange={(e) =>
                        setRating((prev) => ({
                          ...prev,
                          comentario: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="rating-actions">
                    <button
                      className="btn-rating-cancel"
                      onClick={closeRatingModal}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn-rating-submit"
                      onClick={handleSubmitRating}
                    >
                      Enviar Avaliação
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {toastMessage && (
        <div
          className={`success-toast ${toastMessage.isError ? 'error-toast' : ''}`}
        >
          {toastMessage.msg}
        </div>
      )}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      />
    </>
  );
};

export default Services;
