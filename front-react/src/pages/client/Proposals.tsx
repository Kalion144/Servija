
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { listarMinhasPropostas } from '../../services/api';

const Proposals = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [propostas, setPropostas] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dados = await listarMinhasPropostas();
        if (dados.propostas) {
          setPropostas(dados.propostas);
        }
      } catch (error) {
        console.error(error);
      }
    };
    carregarDados();
  }, []);

  const handleAccept = (proposta) => {
    setToast({
      message: `Proposta de ${proposta.profissional} aceita!`,
      isError: false,
    });
    setTimeout(() => setToast(null), 3000);
  };

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
    body { background: #f4f7fb; color: #1e293b; min-height: 100vh; }
    .proposals-container { width: 100%; min-height: 100vh; }
    .user-header { background: #fff; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100; }
    .user-info h2 { font-size: 1.7rem; font-weight: 700; color: #0f172a; }
    .user-info p { color: #64748b; margin-top: 5px; }
    .user-actions { display: flex; gap: 12px; }
    .icon-btn { width: 45px; height: 45px; border: none; border-radius: 12px; background: #f97316; color: #fff; font-size: 1rem; cursor: pointer; transition: 0.3s; }
    .icon-btn:hover { transform: translateY(-2px); background: #ea580c; }
    .main-grid { flex: 1; padding: 30px; }
    .left-column { width: 100%; }
    .section-card { background: #fff; border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .section-header h3 { font-size: 1.4rem; font-weight: 700; color: #0f172a; }
    .badge-count { background: #f97316; color: #fff; padding: 8px 14px; border-radius: 30px; font-weight: 700; font-size: 0.9rem; }
    .proposals-list { display: flex; flex-direction: column; gap: 20px; }
    .proposal-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; padding: 22px; transition: 0.3s; }
    .proposal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .professional-name { font-size: 1.1rem; font-weight: 700; color: #0f172a; }
    .status-badge { background: #fff3e0; color: #c96f0e; padding: 4px 12px; border-radius: 30px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .proposal-price { font-size: 1.2rem; font-weight: 800; color: #16a34a; margin-bottom: 12px; }
    .proposal-description { color: #475569; line-height: 1.6; margin-bottom: 18px; }
    .btn-accept { background: #f97316; color: #fff; border: none; padding: 10px 18px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.3s; }
    .btn-accept:hover { background: #ea580c; }
    .success-toast { position: fixed; top: 20px; right: 20px; color: #fff; padding: 16px 20px; border-radius: 12px; font-weight: 600; z-index: 9999; box-shadow: 0 8px 20px rgba(0,0,0,0.15); background: #f97316; }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="proposals-container">
        <div className="user-header">
          <div className="user-info">
            <h2>Recebendo Propostas</h2>
            <p>Escolha a melhor opção para o seu serviço</p>
          </div>
          <div className="user-actions">
            <button className="icon-btn" onClick={() => navigate('/client/home')}>
              <i className="fas fa-home"></i>
            </button>
            <button className="icon-btn" onClick={() => navigate('/')}>
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
        <div className="main-grid">
          <div className="left-column">
            <div className="section-card">
              <div className="section-header">
                <h3>
                  <i className="fas fa-file-signature"></i> Propostas Recebidas
                </h3>
                <span className="badge-count">{propostas.length}</span>
              </div>
              <div className="proposals-list">
                {propostas.map((prop) => (
                  <div key={prop.id} className="proposal-card">
                    <div className="proposal-header">
                      <span className="professional-name">
                        {prop.profissional}
                      </span>
                      <span className="status-badge">{prop.status}</span>
                    </div>
                    <div className="proposal-price">Valor: {prop.valor}</div>
                    <div className="proposal-description">{prop.mensagem}</div>
                    <button
                      className="btn-accept"
                      onClick={() => handleAccept(prop)}
                    >
                      Aceitar proposta
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && <div className="success-toast">{toast.message}</div>}
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

