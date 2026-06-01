import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  listarMeusServicos,
  atualizarProposta,
  deletarProposta,
  criarServico,
} from '../../services/api';

const Services = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [servicos, setServicos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    titulo: '',
    descricao: '',
    valor: '',
    prazo: '',
  });
  const [createForm, setCreateForm] = useState({
    titulo: '',
    descricao: '',
    valor: '',
    prazo: '',
  });
  const [salvando, setSalvando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    carregarServicos();
  }, []);

  const openServiceModal = (servico) => {
    setSelectedService(servico);
    setConfirmDelete(false);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedService(null);
    setConfirmDelete(false);
  };

  const excluirPedido = async () => {
    setExcluindo(true);
    try {
      await deletarProposta(selectedService.id);
      showToast('🗑️ Pedido excluído!');
      closeModal();
      await carregarServicos();
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Erro ao excluir'}`);
    } finally {
      setExcluindo(false);
      setConfirmDelete(false);
    }
  };
  const handleUpdate = () => {
    showToast('🔄 Página atualizada!');
  };
  const carregarServicos = async () => {
    try {
      const dados = await listarMeusServicos();
      if (dados.servicos) setServicos(dados.servicos);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateService = () => {
    setCreateForm({ titulo: '', descricao: '', valor: '', prazo: '' });
    setCreateModalOpen(true);
  };

  const salvarNovoPedido = async () => {
    if (!createForm.titulo.trim()) {
      showToast('❌ Título obrigatório');
      return;
    }
    setSalvando(true);
    try {
      await criarServico({
        titulo: createForm.titulo,
        descricao: createForm.descricao,
        valor: createForm.valor ? Number(createForm.valor) : null,
        prazo: createForm.prazo,
      });
      showToast('✅ Pedido criado!');
      setCreateModalOpen(false);
      await carregarServicos();
    } catch (err) {
      showToast(
        `❌ ${err instanceof Error ? err.message : 'Erro ao criar pedido'}`
      );
    } finally {
      setSalvando(false);
    }
  };

  const abrirEdicao = (servico) => {
    setEditForm({
      titulo: servico.titulo || '',
      descricao: servico.descricao || '',
      valor: servico.valor ?? '',
      prazo: servico.prazo || '',
    });
    setSelectedService(servico);
    setModalOpen(false);
    setEditModalOpen(true);
  };

  const salvarEdicao = async () => {
    if (!editForm.titulo.trim()) {
      showToast('❌ Título obrigatório');
      return;
    }
    setSalvando(true);
    try {
      await atualizarProposta(selectedService.id, {
        titulo: editForm.titulo,
        descricao: editForm.descricao,
        valor: editForm.valor ? Number(editForm.valor) : null,
        prazo: editForm.prazo,
      });
      showToast('✅ Pedido atualizado!');
      setEditModalOpen(false);
      await carregarServicos();
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Erro ao salvar'}`);
    } finally {
      setSalvando(false);
    }
  };

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f3f4f6; font-family: 'Inter', sans-serif; padding: 1.5rem; color: #1e293b; }
    .services-container { max-width: 1200px; margin: 0 auto; }
    .user-header { background: white; border-radius: 1.5rem; padding: 1.5rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .user-info h2 { font-size: 1.6rem; font-weight: 700; color: #111827; margin-bottom: 0.3rem; }
    .user-info p { color: #64748b; font-size: 0.95rem; }
    .user-actions { display: flex; gap: 0.8rem; }
    .icon-btn { background: #f1f5f9; border: none; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; font-size: 1rem; color: #475569; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
    .icon-btn:hover { background: #f97316; color: white; transform: translateY(-3px); box-shadow: 0 8px 18px rgba(249,115,22,0.25); }
    .main-grid { display: grid; grid-template-columns: 1fr 360px; gap: 1.5rem; }
    .section-card { background: white; border-radius: 1.5rem; padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 0.8rem; }
    .section-header h3 { font-size: 1.2rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 0.5rem; }
    .update-btn { border: none; background: #f97316; color: white; padding: 0.7rem 1rem; border-radius: 2rem; cursor: pointer; font-weight: 600; transition: 0.3s; display: flex; align-items: center; gap: 0.4rem; }
    .update-btn:hover { background: #ea580c; transform: translateY(-2px); }
    .progress-section { margin-bottom: 1.5rem; }
    .progress-label { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem; color: #475569; font-weight: 600; }
    .progress-bar { background: #e2e8f0; border-radius: 2rem; height: 10px; overflow: hidden; }
    .progress-fill { background: linear-gradient(90deg, #f97316, #fb923c); height: 100%; border-radius: 2rem; }
    .status-badge { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.35rem 0.7rem; border-radius: 2rem; font-size: 0.75rem; font-weight: 700; }
    .status-waiting { background: #fef3c7; color: #d97706; }
    .service-card { background: white; border-radius: 1.2rem; padding: 1rem; margin-bottom: 1rem; border: 1px solid #e2e8f0; cursor: pointer; transition: 0.3s; }
    .service-card:hover { border-color: #f97316; transform: translateX(6px); box-shadow: 0 10px 20px rgba(0,0,0,0.06); }
    .service-title { font-weight: 600; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.8rem; color: #0f172a; }
    .service-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; font-size: 0.9rem; color: #64748b; padding-top: 0.8rem; border-top: 1px solid #f1f5f9; }
    .interested-count { font-weight: 600; color: #f97316; }
    .create-btn { width: 100%; background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 1rem; border: none; border-radius: 3rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 1rem; font-size: 1rem; transition: 0.3s; }
    .create-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 20px rgba(249,115,22,0.25); }
    .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: none; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal.active { display: flex; }
    .modal-content { background: white; border-radius: 1.5rem; max-width: 500px; width: 100%; max-height: 85vh; overflow: auto; animation: modalFade 0.3s ease; }
    .modal-header { background: #f97316; color: white; padding: 1.2rem; display: flex; justify-content: space-between; align-items: center; }
    .close-modal { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; }
    .modal-body { padding: 1.5rem; color: #334155; line-height: 1.7; }
    .edit-field { margin-bottom: 1rem; }
    .edit-field label { display: block; font-weight: 600; margin-bottom: 0.4rem; font-size: 0.9rem; color: #475569; }
    .edit-field input, .edit-field textarea { width: 100%; padding: 0.7rem 1rem; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; font-family: inherit; }
    .edit-field input:focus, .edit-field textarea:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
    .edit-field textarea { min-height: 90px; resize: vertical; }
    .modal-actions { display: flex; gap: 0.8rem; margin-top: 1.2rem; }
    .btn-save { flex: 1; background: #f97316; color: white; border: none; padding: 0.8rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
    .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-cancel-edit { flex: 1; background: #f1f5f9; color: #475569; border: none; padding: 0.8rem; border-radius: 10px; font-weight: 600; cursor: pointer; }
    .btn-delete { width: 100%; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; padding: 0.75rem; border-radius: 10px; font-weight: 600; cursor: pointer; margin-top: 0.6rem; transition: 0.2s; }
    .btn-delete:hover { background: #dc2626; color: white; }
    .btn-delete-confirm { background: #dc2626; color: white; border: none; padding: 0.8rem; border-radius: 10px; font-weight: 700; cursor: pointer; flex: 1; }
    .btn-delete-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
    .confirm-box { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 10px; padding: 1rem; margin-top: 0.6rem; }
    .confirm-box p { color: #dc2626; font-weight: 600; margin-bottom: 0.8rem; font-size: 0.9rem; }
    .success-toast { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); background: #f97316; color: white; padding: 0.9rem 1.8rem; border-radius: 3rem; z-index: 1000; font-weight: 600; box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
    @media (max-width: 768px) { .main-grid { grid-template-columns: 1fr; } .user-header { flex-direction: column; align-items: flex-start; } }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="services-container">
        <div className="user-header">
          <div className="user-info">
            <h2>Olá, {usuario?.nome?.split(' ')[0] || 'Cliente'}</h2>
            <p>Acompanhe seus pedidos</p>
          </div>
          <div className="user-actions">
            <button
              className="icon-btn"
              onClick={() => navigate('/client/home')}
            >
              <i className="fas fa-home"></i>
            </button>
            <button
              className="icon-btn"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
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
                  <i className="fas fa-clipboard-list"></i> Pedidos Abertos
                </h3>
                <button className="update-btn" onClick={handleUpdate}>
                  <i className="fas fa-sync-alt"></i> Atualizar
                </button>
              </div>
              <div className="progress-section">
                <div className="progress-label">
                  <span>Ativos</span>
                  <span>{servicos.length}-Pedidos</span>
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
              {servicos.map((servico) => (
                <div
                  key={servico.id}
                  className="service-card"
                  onClick={() => openServiceModal(servico)}
                >
                  <div className="service-title">
                    <span>{servico.titulo}</span>
                    <span className="status-badge status-waiting">
                      <i className="fas fa-clock"></i> Aguardando
                    </span>
                  </div>
                  <div className="service-footer">
                    <span>
                      <i className="fas fa-users"></i>{' '}
                      <span className="interested-count">0 interessados</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="right-column">
            <div className="section-card">
              <div className="section-header">
                <h3>
                  <i className="fas fa-chart-line"></i> Status
                </h3>
              </div>
              <div className="status-list">
                {servicos.map((servico) => (
                  <div
                    key={servico.id}
                    className="status-item"
                    onClick={() => openServiceModal(servico)}
                  >
                    <div>
                      <strong>{servico.titulo}</strong>
                    </div>
                    <div>
                      <span>Aguardando profissionais</span>{' '}
                      <span className="interested-count"> 0 interessados</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="create-btn" onClick={handleCreateService}>
              <i className="fas fa-plus-circle"></i> + Criar Novo Pedido
            </button>
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
                &times;
              </button>
            </div>
            <div className="modal-body">
              {selectedService &&
                (() => {
                  const statusConfig = {
                    PENDENTE: {
                      label: 'Pendente',
                      color: '#d97706',
                      bg: '#fef3c7',
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
                      label: 'Finalizada',
                      color: '#7c3aed',
                      bg: '#ede9fe',
                      icon: 'fa-flag-checkered',
                    },
                    AVALIADA: {
                      label: 'Avaliada',
                      color: '#0891b2',
                      bg: '#cffafe',
                      icon: 'fa-star',
                    },
                    CANCELADA: {
                      label: 'Cancelada',
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
                  const podeEditar = selectedService.status === 'PENDENTE';
                  const podeExcluir =
                    selectedService.status === 'PENDENTE' ||
                    selectedService.status === 'FINALIZADA';
                  return (
                    <>
                      <div style={{ marginBottom: '1rem' }}>
                        <h2
                          style={{
                            fontSize: '1.25rem',
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
                            padding: '0.3rem 0.8rem',
                            borderRadius: '2rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                          }}
                        >
                          <i className={`fas ${s.icon}`}></i> {s.label}
                        </span>
                      </div>

                      {selectedService.descricao && (
                        <div
                          style={{
                            background: '#f8fafc',
                            borderRadius: '10px',
                            padding: '0.8rem 1rem',
                            marginBottom: '1rem',
                            color: '#475569',
                            fontSize: '0.93rem',
                            lineHeight: 1.6,
                          }}
                        >
                          <i
                            className="fas fa-align-left"
                            style={{ color: '#f97316', marginRight: '0.4rem' }}
                          ></i>
                          {selectedService.descricao}
                        </div>
                      )}

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '0.7rem',
                          marginBottom: '1.2rem',
                        }}
                      >
                        <div
                          style={{
                            background: '#f8fafc',
                            borderRadius: '10px',
                            padding: '0.75rem 1rem',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: '#94a3b8',
                              fontWeight: 600,
                              marginBottom: '0.2rem',
                            }}
                          >
                            <i
                              className="fas fa-dollar-sign"
                              style={{ color: '#16a34a' }}
                            ></i>{' '}
                            VALOR SUGERIDO
                          </div>
                          <div
                            style={{
                              fontSize: '1.1rem',
                              fontWeight: 700,
                              color: '#16a34a',
                            }}
                          >
                            {selectedService.valor
                              ? `R$ ${Number(selectedService.valor).toFixed(2)}`
                              : '—'}
                          </div>
                        </div>
                        <div
                          style={{
                            background: '#f8fafc',
                            borderRadius: '10px',
                            padding: '0.75rem 1rem',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: '#94a3b8',
                              fontWeight: 600,
                              marginBottom: '0.2rem',
                            }}
                          >
                            <i
                              className="fas fa-calendar-alt"
                              style={{ color: '#f97316' }}
                            ></i>{' '}
                            PRAZO
                          </div>
                          <div
                            style={{
                              fontSize: '0.95rem',
                              fontWeight: 600,
                              color: '#334155',
                            }}
                          >
                            {selectedService.prazo || '—'}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.6rem',
                        }}
                      >
                        {podeEditar && (
                          <button
                            className="create-btn"
                            style={{ margin: 0 }}
                            onClick={() => abrirEdicao(selectedService)}
                          >
                            ✏️ Editar pedido
                          </button>
                        )}
                        {podeExcluir &&
                          (!confirmDelete ? (
                            <button
                              className="btn-delete"
                              onClick={() => setConfirmDelete(true)}
                            >
                              🗑️ Excluir pedido
                            </button>
                          ) : (
                            <div className="confirm-box">
                              <p>Tem certeza que deseja excluir este pedido?</p>
                              <div className="modal-actions">
                                <button
                                  className="btn-cancel-edit"
                                  onClick={() => setConfirmDelete(false)}
                                >
                                  Cancelar
                                </button>
                                <button
                                  className="btn-delete-confirm"
                                  onClick={excluirPedido}
                                  disabled={excluindo}
                                >
                                  {excluindo
                                    ? 'Excluindo...'
                                    : 'Confirmar exclusão'}
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </>
                  );
                })()}
            </div>
          </div>
        </div>
      </div>
      {/* Modal de edição */}
      <div
        className={`modal ${editModalOpen ? 'active' : ''}`}
        onClick={() => setEditModalOpen(false)}
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>✏️ Editar pedido</h3>
            <button
              className="close-modal"
              onClick={() => setEditModalOpen(false)}
            >
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="edit-field">
              <label>Título *</label>
              <input
                type="text"
                value={editForm.titulo}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, titulo: e.target.value }))
                }
              />
            </div>
            <div className="edit-field">
              <label>Descrição</label>
              <textarea
                value={editForm.descricao}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, descricao: e.target.value }))
                }
              />
            </div>
            <div className="edit-field">
              <label>Valor sugerido (R$)</label>
              <input
                type="number"
                step="0.01"
                value={editForm.valor}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, valor: e.target.value }))
                }
              />
            </div>
            <div className="edit-field">
              <label>Prazo</label>
              <input
                type="text"
                placeholder="Ex: 3 dias, até 10/07"
                value={editForm.prazo}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, prazo: e.target.value }))
                }
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-cancel-edit"
                onClick={() => setEditModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-save"
                onClick={salvarEdicao}
                disabled={salvando}
              >
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de criação de pedido */}
      <div
        className={`modal ${createModalOpen ? 'active' : ''}`}
        onClick={() => setCreateModalOpen(false)}
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>➕ Criar novo pedido</h3>
            <button
              className="close-modal"
              onClick={() => setCreateModalOpen(false)}
            >
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="edit-field">
              <label>Título *</label>
              <input
                type="text"
                placeholder="Ex: Instalação elétrica"
                value={createForm.titulo}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, titulo: e.target.value }))
                }
              />
            </div>
            <div className="edit-field">
              <label>Descrição</label>
              <textarea
                placeholder="Descreva o serviço que você precisa"
                value={createForm.descricao}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, descricao: e.target.value }))
                }
              />
            </div>
            <div className="edit-field">
              <label>Valor sugerido (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 150.00"
                value={createForm.valor}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, valor: e.target.value }))
                }
              />
            </div>
            <div className="edit-field">
              <label>Prazo</label>
              <input
                type="text"
                placeholder="Ex: 3 dias, até 10/07"
                value={createForm.prazo}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, prazo: e.target.value }))
                }
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-cancel-edit"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-save"
                onClick={salvarNovoPedido}
                disabled={salvando}
              >
                {salvando ? 'Criando...' : 'Criar pedido'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && <div className="success-toast">{toastMessage}</div>}
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
