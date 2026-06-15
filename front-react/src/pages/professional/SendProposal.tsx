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
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!servico) navigate('/professional/home');
  }, [servico, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mensagem.trim()) {
      setToast({
        message: 'Escreva uma mensagem para o cliente!',
        isError: true,
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setSalvando(true);
    try {
      await enviarProposta({
        servicoId: servico.id,
        mensagem,
        valor: valor ? Number(valor) : null,
        negociavel,
      });
      setToast({ message: '✅ Proposta enviada com sucesso!', isError: false });
      setTimeout(() => navigate('/professional/proposals'), 1800);
    } catch (error) {
      console.error(error);
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Erro ao enviar proposta, tente novamente!';
      setToast({
        message: mensagem,
        isError: true,
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSalvando(false);
    }
  };

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
    body { background: #fff7ed; }
    .proposal-container { max-width: 820px; margin: 0 auto; background: white; border-radius: 40px; overflow: hidden; box-shadow: 0 25px 45px -12px rgba(0,0,0,0.15); margin-top: 32px; }
    .proposal-header { background: linear-gradient(115deg, #f97316, #ea580c); padding: 28px 36px; color: white; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .proposal-header h1 { font-size: 1.7rem; display: flex; align-items: center; gap: 10px; }
    .user-actions { display: flex; gap: 12px; }
    .icon-btn { width: 44px; height: 44px; border: none; border-radius: 12px; background: rgba(255,255,255,0.18); color: white; cursor: pointer; font-size: 18px; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
    .icon-btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-1px); }
    .proposal-body { padding: 32px 36px; }
    .client-info-card { display: flex; gap: 1.2rem; align-items: center; background: #fff7ed; padding: 1.4rem; border-radius: 24px; margin-bottom: 2rem; border: 1px solid #fed7aa; }
    .client-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #f97316, #ea580c); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.5rem; }
    .client-name { font-weight: 700; font-size: 1.2rem; color: #7c2d12; margin-bottom: 6px; }
    .client-details { color: #c2410c; font-size: 0.95rem; }
    .form-group { margin-bottom: 1.8rem; }
    .form-group label { display: block; font-weight: 600; margin-bottom: 0.8rem; color: #7c2d12; font-size: 1rem; }
    textarea, input { width: 100%; padding: 14px 18px; border-radius: 20px; border: 1.5px solid #fed7aa; font-family: inherit; font-size: 1rem; background: #fffbeb; color: #431407; }
    textarea { min-height: 130px; resize: vertical; }
    input:focus, textarea:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); background: white; }
    .checkbox-container { display: flex; align-items: center; gap: 0.8rem; margin-top: 0.8rem; }
    .checkbox-container input[type="checkbox"] { width: auto; cursor: pointer; accent-color: #f97316; }
    .btn-submit { width: 100%; background: linear-gradient(135deg, #f97316, #ea580c); color: white; border: none; padding: 1.1rem; border-radius: 60px; font-weight: 700; cursor: pointer; margin-top: 1rem; transition: all 0.2s; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 12px rgba(249,115,22,0.25); }
    .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(249,115,22,0.35); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
    .success-toast { position: fixed; top: 24px; right: 24px; padding: 14px 24px; border-radius: 60px; color: white; font-weight: 600; z-index: 9999; box-shadow: 0 4px 14px rgba(0,0,0,0.15); background: #16a34a; animation: fadeIn 0.2s ease; }
    .error-toast { background: #dc2626; }
    @keyframes fadeIn { from { opacity:0; transform: translateY(-6px); } to { opacity:1; transform: translateY(0); } }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="proposal-container">
        <div className="proposal-header">
          <h1>
            <i className="fas fa-paper-plane"></i> Enviar Proposta
          </h1>
          <div className="user-actions">
            <button
              className="icon-btn"
              onClick={() => navigate('/professional/home')}
              title="Voltar para Home"
            >
              <i className="fas fa-home"></i>
            </button>
            <button
              className="icon-btn"
              onClick={() => navigate('/professional/proposals')}
              title="Minhas Propostas"
            >
              <i className="fas fa-briefcase"></i>
            </button>
            <button
              className="icon-btn"
              onClick={() => navigate('/professional/profile')}
              title="Meu Perfil"
            >
              <i className="fas fa-user"></i>
            </button>
          </div>
        </div>
        <div className="proposal-body">
          {servico && (
            <div className="client-info-card">
              <div className="client-avatar">
                {servico.cliente_nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="client-name">{servico.cliente_nome}</div>
                <div className="client-details">
                  <i className="fas fa-map-marker-alt"></i>{' '}
                  {servico.localizacao} · {servico.titulo}
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <i className="fas fa-comment-dots"></i> Mensagem para o Cliente{' '}
                <span style={{ color: '#dc2626' }}>(obrigatório)</span>
              </label>
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Descreva sua proposta, experiência e como você pode ajudar o cliente..."
                required
              />
            </div>
            <div className="form-group">
              <label>
                <i className="fas fa-coins"></i> Valor{' '}
                <span style={{ color: '#9a3412' }}>(opcional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="Ex: 150.00"
              />
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="negociavel"
                  checked={negociavel}
                  onChange={(e) => setNegociavel(e.target.checked)}
                />
                <label
                  htmlFor="negociavel"
                  style={{ marginBottom: 0, fontWeight: 600, color: '#7c2d12' }}
                >
                  Valor negociável
                </label>
              </div>
            </div>
            <button type="submit" className="btn-submit" disabled={salvando}>
              <i className="fas fa-paper-plane"></i>
              {salvando ? ' Enviando proposta...' : ' Enviar Proposta'}
            </button>
          </form>
        </div>
      </div>
      {toast && (
        <div className={`success-toast ${toast.isError ? 'error-toast' : ''}`}>
          {toast.message}
        </div>
      )}
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
}
