
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { enviarProposta } from '../../services/api';

export default function SendProposal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  const { servico } = location.state || {};
  const [mensagem, setMensagem] = useState('');
  const [valor, setValor] = useState(servico?.preco || '');
  const [negociavel, setNegociavel] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!servico) navigate('/professional/home');
  }, [servico, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mensagem.trim()) {
      setToast({
        message: 'Escreva uma mensagem para o cliente.',
        isError: true,
      });
      return;
    }
    try {
      await criarProposta({
        servicoId: servico.id,
        mensagem,
        valor,
        negociavel,
      });
      setToast({ message: 'Proposta enviada com sucesso!', isError: false });
      setTimeout(() => navigate('/professional/proposals'), 1500);
    } catch (error) {
      console.error(error);
      setToast({
        message: 'Erro ao enviar proposta',
        isError: true,
      });
    }
  };

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f4f7fd; font-family: 'Inter', sans-serif; }
    .proposal-container { max-width: 820px; margin: 0 auto; background: white; border-radius: 48px; overflow: hidden; box-shadow: 0 25px 45px -12px rgba(0,0,0,0.25); }
    .proposal-header { background: linear-gradient(115deg, #1f3b4c, #1c5a6b); padding: 28px 32px; color: white; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; }
    .proposal-header h1 { font-size: 1.8rem; }
    .user-actions { display: flex; gap: 12px; }
    .icon-btn { width: 45px; height: 45px; border: none; border-radius: 12px; background: rgba(255,255,255,0.15); color: white; cursor: pointer; font-size: 18px; transition: 0.3s; }
    .icon-btn:hover { background: #f97316; transform: translateY(-2px); }
    .proposal-body { padding: 32px 36px; }
    .client-info-card { display: flex; gap: 1rem; align-items: center; background: #f8fafc; padding: 1rem; border-radius: 1rem; margin-bottom: 1.5rem; }
    .client-details h3 { margin: 0; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; font-weight: 600; margin-bottom: 0.5rem; }
    textarea, input { width: 100%; padding: 0.8rem; border-radius: 1rem; border: 1px solid #e2e8f0; font-family: inherit; }
    .btn-submit { width: 100%; background: #f97316; color: white; border: none; padding: 1rem; border-radius: 3rem; font-weight: bold; cursor: pointer; margin-top: 1rem; transition: 0.3s; }
    .btn-submit:hover { background: #ea580c; }
    .success-toast { position: fixed; top: 20px; right: 20px; padding: 12px 20px; border-radius: 40px; color: white; font-weight: 600; z-index: 9999; background: #f97316; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="proposal-container">
        <div className="proposal-header">
          <h1>📩 Enviar proposta</h1>
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
          </div>
        </div>
        <div className="proposal-body">
          <div className="client-info-card">
            <div className="client-details">
              <h3>{servico?.clienteNome || 'Cliente'}</h3>
              <p>
                📍 {servico?.localizacao} · Serviço: {servico?.titulo}
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                💬 Mensagem para o cliente <span>(obrigatório)</span>
              </label>
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={4}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label>
                💰 Sugerir um valor <span>(opcional)</span>
              </label>
              <input
                type="text"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="Ex: 1200,00"
              />
              <label
                style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={negociavel}
                  onChange={(e) => setNegociavel(e.target.checked)}
                />{' '}
                Marc o como "negociável"
              </label>
            </div>
            <button type="submit" className="btn-submit">
              <i className="fas fa-paper-plane"></i> Enviar proposta
            </button>
          </form>
        </div>
      </div>
      {toast && <div className="success-toast">{toast.message}</div>}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      />
    </>
  );
}

