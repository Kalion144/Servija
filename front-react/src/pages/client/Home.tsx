import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { listarProfissionais, listarMinhasPropostas, enviarPropostaParaProfissionais } from '../../services/api';

const Home = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [prestadores, setPrestadores] = useState<any[]>([]);
  const [minhasPropostas, setMinhasPropostas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);
  const [propostaSelecionada, setPropostaSelecionada] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', isError: false });
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, isError = false) => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ visible: true, message, isError });
    toastRef.current = setTimeout(() => setToast({ visible: false, message: '', isError: false }), 3500);
  };

  useEffect(() => {
    const carregar = async () => {
      try {
        const [profData, propData] = await Promise.all([
          listarProfissionais(),
          listarMinhasPropostas(),
        ]);
        if (profData.profissionais) setPrestadores(profData.profissionais);
        else if (Array.isArray(profData)) setPrestadores(profData);

        const propostas = propData.propostas ?? propData;
        if (Array.isArray(propostas)) {
          setMinhasPropostas(propostas.filter((p: any) => p.status === 'PENDENTE'));
        }
      } catch (e) {
        console.error(e);
      }
    };
    carregar();
  }, []);

  useEffect(() => {
    return () => { if (toastRef.current) clearTimeout(toastRef.current); };
  }, []);

  const clienteNome = usuario?.nome || 'Cliente';

  const openModal = (prof: any) => {
    setSelectedProfessional(prof);
    setPropostaSelecionada('');
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setSelectedProfessional(null); };
  const handleOverlayClick = (e: React.MouseEvent) => { if (e.target === e.currentTarget) closeModal(); };

  const handleEnviarProposta = async () => {
    if (!propostaSelecionada) {
      showToast('Selecione uma proposta para enviar', true);
      return;
    }
    setEnviando(true);
    try {
      await enviarPropostaParaProfissionais(propostaSelecionada, [selectedProfessional.id]);
      showToast(`✅ Proposta enviada para ${selectedProfessional.nome}!`);
      closeModal();
    } catch (e: any) {
      showToast(e.message || 'Erro ao enviar proposta', true);
    } finally {
      setEnviando(false);
    }
  };

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
    body { background: #f3f4f6; color: #111827; }

    .user-header {
      background: white; padding: 16px 32px;
      display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 100;
      flex-wrap: wrap; gap: 12px;
    }
    .user-info h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 3px; }
    .user-location { color: #6b7280; font-size: 0.85rem; }
    .user-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .icon-btn {
      width: 42px; height: 42px; border: none; border-radius: 12px;
      background: #f3f4f6; color: #374151;
      display: flex; align-items: center; justify-content: center;
      font-size: 17px; transition: 0.2s; cursor: pointer;
    }
    .icon-btn:hover { background: #f97316; color: white; transform: translateY(-2px); }

    .main-content { padding: 28px 28px 0; }
    .section-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 18px; color: #111827; }

    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 18px; margin-bottom: 40px; }

    .professional-card {
      background: white; padding: 20px; border-radius: 20px; cursor: pointer;
      transition: 0.25s; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      border: 1.5px solid #f0f0f0;
    }
    .professional-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); border-color: #fbd5b5; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .prof-name { font-weight: 700; font-size: 1rem; color: #111827; }
    .rating { color: #f59e0b; font-weight: 600; font-size: 0.85rem; }
    .prof-role { font-weight: 700; color: #f97316; font-size: 0.9rem; margin-bottom: 6px; }
    .prof-bio { color: #6b7280; font-size: 0.83rem; margin-bottom: 12px; line-height: 1.4; }
    .prof-meta { display: flex; justify-content: space-between; font-size: 0.78rem; color: #6b7280; }
    .send-btn {
      margin-top: 12px; width: 100%; padding: 9px; border-radius: 12px;
      background: #f97316; color: white; border: none;
      font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.2s;
    }
    .send-btn:hover { background: #ea580c; }

    .empty-card { background: white; padding: 32px; border-radius: 20px; text-align: center; color: #6b7280; }

    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 999; padding: 16px;
    }
    .modal-box {
      width: 100%; max-width: 540px; background: white; border-radius: 24px;
      overflow: hidden; animation: fadeUp 0.25s ease;
    }
    @keyframes fadeUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-head {
      padding: 18px 22px; background: linear-gradient(95deg, #f97316, #ea580c);
      color: white; display: flex; justify-content: space-between; align-items: center;
    }
    .modal-head h3 { font-size: 1rem; font-weight: 700; }
    .close-btn { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; line-height: 1; }
    .modal-body { padding: 22px; }
    .modal-prof-name { font-size: 1.5rem; font-weight: 700; color: #111827; margin-bottom: 4px; }
    .modal-badge { display: inline-block; background: #fff7ed; color: #c2410c; font-size: 0.8rem; font-weight: 700; padding: 3px 12px; border-radius: 40px; margin-bottom: 16px; }
    .modal-info-row { display: flex; gap: 8px; margin-bottom: 10px; font-size: 0.88rem; color: #374151; }
    .modal-info-row strong { min-width: 90px; color: #111827; }

    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 18px 0; }

    .send-section h4 { font-size: 0.95rem; font-weight: 700; color: #111827; margin-bottom: 10px; }
    .select-proposta {
      width: 100%; padding: 11px 14px; border: 1.5px solid #e5e7eb;
      border-radius: 14px; font-size: 0.88rem; font-family: inherit;
      background: white; outline: none; cursor: pointer; transition: 0.2s;
    }
    .select-proposta:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
    .no-proposals { font-size: 0.85rem; color: #6b7280; margin-bottom: 10px; }
    .create-proposal-link {
      display: inline-block; margin-top: 6px; color: #f97316;
      font-weight: 600; font-size: 0.85rem; cursor: pointer;
      text-decoration: underline;
    }

    .contact-btn {
      width: 100%; margin-top: 14px; padding: 13px; border: none;
      border-radius: 14px; background: #f97316; color: white;
      font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: 0.2s;
      font-family: inherit;
    }
    .contact-btn:hover:not(:disabled) { background: #ea580c; }
    .contact-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      color: white; padding: 12px 24px; border-radius: 40px;
      font-weight: 600; font-size: 0.9rem; z-index: 9999;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    .footer { background: #111827; color: white; padding: 40px 28px 20px; margin-top: 20px; }
    .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 28px; margin-bottom: 28px; }
    .footer-col h4 { color: #f97316; margin-bottom: 12px; font-size: 0.95rem; }
    .footer-col p, .footer-col a { color: #d1d5db; margin-bottom: 8px; display: block; text-decoration: none; font-size: 0.85rem; }
    .footer-col a:hover { color: white; }
    .footer-bottom { border-top: 1px solid #374151; padding-top: 16px; text-align: center; color: #9ca3af; font-size: 0.82rem; }

    @media (max-width: 680px) {
      .user-header { padding: 14px 16px; }
      .main-content { padding: 18px 14px 0; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      <div className="user-header">
        <div className="user-info">
          <h2>Olá, {clienteNome.split(' ')[0]}</h2>
          <div className="user-location">
            <i className="fas fa-map-marker-alt" /> Brasília - DF
          </div>
        </div>
        <div className="user-actions">
          <button className="icon-btn" title="Home" onClick={() => navigate('/client/home')}><i className="fas fa-home" /></button>
          <button className="icon-btn" title="Publicar" onClick={() => navigate('/client/post-service')}><i className="fas fa-plus-circle" /></button>
          <button className="icon-btn" title="Meus pedidos" onClick={() => navigate('/client/services')}><i className="fas fa-briefcase" /></button>
          <button className="icon-btn" title="Perfil" onClick={() => navigate('/client/profile')}><i className="fas fa-user" /></button>
          <button className="icon-btn" title="Sair" onClick={async () => { await logout(); navigate('/'); }}><i className="fas fa-sign-out-alt" /></button>
        </div>
      </div>

      <div className="main-content">
        <div className="section-title">
          <i className="fas fa-users" /> Profissionais disponíveis
        </div>
        <div className="cards-grid">
          {prestadores.map((prof) => (
            <div key={prof.id} className="professional-card">
              <div className="card-header">
                <span className="prof-name">{prof.nome}</span>
                <span className="rating"><i className="fas fa-star" /> Novo</span>
              </div>
              <div className="prof-role">{prof.profissao || 'Profissional'}</div>
              <div className="prof-bio">
                {prof.bio ? prof.bio.substring(0, 80) + (prof.bio.length > 80 ? '…' : '') : 'Profissional disponível para serviços.'}
              </div>
              <div className="prof-meta">
                <span><i className="fas fa-map-marker-alt" /> {prof.localizacao || 'Local não informado'}</span>
                <span>{prof.valor_hora ? `R$ ${prof.valor_hora}/h` : 'Sob consulta'}</span>
              </div>
              <button className="send-btn" onClick={() => openModal(prof)}>
                Enviar proposta →
              </button>
            </div>
          ))}
          {prestadores.length === 0 && (
            <div className="empty-card">
              <p>Nenhum profissional cadastrado ainda.</p>
            </div>
          )}
        </div>
      </div>

      <div className="footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Servijá</h4>
            <p>Conectando pessoas a prestadores de forma rápida e segura.</p>
          </div>
          <div className="footer-col">
            <h4>Para clientes</h4>
            <a onClick={() => navigate('/client/post-service')}>Publicar pedido</a>
            <a onClick={() => navigate('/client/services')}>Meus pedidos</a>
          </div>
          <div className="footer-col">
            <h4>Contato</h4>
            <p><i className="fas fa-envelope" /> contato@servija.com.br</p>
          </div>
        </div>
        <div className="footer-bottom">© 2024 Servijá — Todos os direitos reservados.</div>
      </div>

      {modalOpen && selectedProfessional && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-box">
            <div className="modal-head">
              <h3><i className="fas fa-user-circle" /> Detalhes do Profissional</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-prof-name">{selectedProfessional.nome}</div>
              <span className="modal-badge">⭐ Profissional verificado</span>

              <div className="modal-info-row"><strong>Profissão:</strong> {selectedProfessional.profissao || '—'}</div>
              <div className="modal-info-row"><strong>Localização:</strong> {selectedProfessional.localizacao || 'Não informada'}</div>
              <div className="modal-info-row"><strong>Valor/hora:</strong> {selectedProfessional.valor_hora ? `R$ ${selectedProfessional.valor_hora}` : 'Sob consulta'}</div>
              {selectedProfessional.bio && (
                <div className="modal-info-row"><strong>Sobre:</strong> {selectedProfessional.bio}</div>
              )}

              <hr className="divider" />

              <div className="send-section">
                <h4>Enviar uma proposta para este profissional</h4>
                {minhasPropostas.length > 0 ? (
                  <>
                    <select
                      className="select-proposta"
                      value={propostaSelecionada}
                      onChange={(e) => setPropostaSelecionada(e.target.value)}
                    >
                      <option value="">— Selecione uma proposta —</option>
                      {minhasPropostas.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.titulo} {p.valor ? `· R$ ${p.valor}` : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      className="contact-btn"
                      onClick={handleEnviarProposta}
                      disabled={enviando || !propostaSelecionada}
                    >
                      {enviando ? 'Enviando…' : `Enviar para ${selectedProfessional.nome.split(' ')[0]}`}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="no-proposals">Você não tem propostas abertas para enviar.</p>
                    <span className="create-proposal-link" onClick={() => { closeModal(); navigate('/client/post-service'); }}>
                      + Criar nova proposta
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast.visible && (
        <div className="toast" style={{ background: toast.isError ? '#b91c1c' : '#1f6e5c' }}>
          {toast.message}
        </div>
      )}
    </>
  );
};

export default Home;
