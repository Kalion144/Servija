import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  listarPropostasRecebidas,
  aceitarPropostaCliente,
  recusarPropostaCliente,
} from '../../services/api';

const Proposals = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [propostas, setPropostas] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    carregarPropostas();
  }, []);

  const carregarPropostas = async () => {
    try {
      const dados = await listarPropostasRecebidas();
      if (dados.propostas) {
        setPropostas(dados.propostas);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAccept = async (proposta) => {
    try {
      await aceitarPropostaCliente(proposta.id);
      setToast({
        message: `Proposta de ${proposta.profissional.nome} aceita!`,
        isError: false,
      });
      setTimeout(() => setToast(null), 3000);
      await carregarPropostas();
    } catch (error) {
      console.error(error);
      setToast({
        message: 'Erro ao aceitar proposta',
        isError: true,
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleReject = async (proposta) => {
    try {
      await recusarPropostaCliente(proposta.id);
      setToast({
        message: `Proposta de ${proposta.profissional.nome} recusada!`,
        isError: false,
      });
      setTimeout(() => setToast(null), 3000);
      await carregarPropostas();
    } catch (error) {
      console.error(error);
      setToast({
        message: 'Erro ao recusar proposta',
        isError: true,
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const formatarValor = (valor) => {
    if (!valor) return 'A negociar';
    return `R$ ${Number(valor).toFixed(2)}`;
  };

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f0f4fa; color: #1e293b; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .proposals-container { width: 100%; min-height: 100vh; }
    .user-header { background: #fff; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100; border-bottom: 1px solid #e6eef8; }
    .user-info h2 { font-size: 1.7rem; font-weight: 700; color: #0f172a; }
    .user-info p { color: #64748b; margin-top: 5px; }
    .user-actions { display: flex; gap: 12px; }
    .icon-btn { width: 45px; height: 45px; border: none; border-radius: 12px; background: #3b82f6; color: #fff; font-size: 1rem; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
    .icon-btn:hover { transform: translateY(-2px); background: #2563eb; }
    .main-grid { padding: 30px; }
    .left-column { width: 100%; max-width: 1100px; margin: 0 auto; }
    .section-card { background: #fff; border-radius: 28px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e6eef8; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .section-header h3 { font-size: 1.4rem; font-weight: 700; color: #0f172a; }
    .badge-count { background: #3b82f6; color: #fff; padding: 8px 14px; border-radius: 30px; font-weight: 700; font-size: 0.9rem; }
    .proposals-list { display: flex; flex-direction: column; gap: 20px; }
    .proposal-card { background: #f8fafc; border: 1px solid #dbe5f5; border-radius: 20px; padding: 22px; transition: 0.3s; }
    .proposal-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(59,130,246,0.08); border-color: #93c5fd; }
    .proposal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .professional-info { display: flex; align-items: center; gap: 12px; }
    .professional-avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #2563eb); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 1.2rem; }
    .status-badge { background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 30px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .status-badge.accepted { background: #dcfce7; color: #16a34a; }
    .status-badge.rejected { background: #fee2e2; color: #dc2626; }
    .proposal-price { font-size: 1.2rem; font-weight: 800; color: #3b82f6; margin-bottom: 8px; }
    .proposal-description { color: #475569; line-height: 1.6; margin-bottom: 18px; }
    .proposal-actions { display: flex; gap: 12px; }
    .btn-accept { background: #3b82f6; color: #fff; border: none; padding: 10px 18px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 0.4rem; }
    .btn-accept:hover { background: #2563eb; }
    .btn-reject { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; padding: 10px 18px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 0.4rem; }
    .btn-reject:hover { background: #dc2626; color: #fff; }
    .success-toast { position: fixed; top: 20px; right: 20px; color: #fff; padding: 16px 20px; border-radius: 12px; font-weight: 600; z-index: 9999; box-shadow: 0 8px 20px rgba(0,0,0,0.15); background: #16a34a; }
    .error-toast { background: #dc2626; }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="proposals-container">
        <div className="user-header">
          <div className="user-info">
            <h2>Propostas Recebidas</h2>
            <p>Veja e responda às propostas dos profissionais</p>
          </div>
          <div className="user-actions">
            <button
              className="icon-btn"
              onClick={() => navigate('/client/services')}
            >
              <i className="fas fa-home"></i>
            </button>
          </div>
        </div>
        <div className="main-grid">
          <div className="left-column">
            <div className="section-card">
              <div className="section-header">
                <h3>
                  <i className="fas fa-file-signature"></i> Propostas
                </h3>
                <span className="badge-count">{propostas.length}</span>
              </div>
              {propostas.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#64748b',
                  }}
                >
                  <i
                    className="fas fa-inbox"
                    style={{ fontSize: '3rem', marginBottom: '1rem' }}
                  ></i>
                  <p>Nenhuma proposta recebida ainda</p>
                </div>
              ) : (
                <div className="proposals-list">
                  {propostas.map((prop) => (
                    <div key={prop.id} className="proposal-card">
                      <div className="proposal-header">
                        <div className="professional-info">
                          <div className="professional-avatar">
                            {prop.profissional.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                color: '#0f172a',
                                fontSize: '1.1rem',
                              }}
                            >
                              {prop.profissional.nome}
                            </div>
                            <div
                              style={{ color: '#64748b', fontSize: '0.9rem' }}
                            >
                              {prop.servico.titulo}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`status-badge ${prop.status.toLowerCase()}`}
                        >
                          {prop.status === 'PENDENTE'
                            ? 'Pendente'
                            : prop.status === 'ACEITA'
                              ? 'Aceita'
                              : prop.status === 'RECUSADA'
                                ? 'Recusada'
                                : prop.status}
                        </span>
                      </div>
                      <div className="proposal-price">
                        {formatarValor(prop.valor)}
                        {prop.negociavel === 1 && ' (Negociável)'}
                      </div>
                      {prop.mensagem && (
                        <div className="proposal-description">
                          {prop.mensagem}
                        </div>
                      )}
                      {prop.status === 'PENDENTE' && (
                        <div className="proposal-actions">
                          <button
                            className="btn-accept"
                            onClick={() => handleAccept(prop)}
                          >
                            <i className="fas fa-check"></i> Aceitar
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleReject(prop)}
                          >
                            <i className="fas fa-times"></i> Recusar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <div className={`success-toast ${toast.isError ? 'error-toast' : ''}`}>
          {toast.message}
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

export default Proposals;
