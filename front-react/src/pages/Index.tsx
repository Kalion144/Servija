import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Toast } from '../components/Toast';
import { ToastState } from '../lib/types';

export default function Index() {
  const navigate = useNavigate();
  const { usuario, loading } = useAuth();
  const [toast, setToast] = useState<ToastState | null>(null);
  const showToast = (msg: string, err = false) =>
    setToast({ message: msg, isError: err });

  useEffect(() => {
    if (!loading && usuario) {
      navigate(
        usuario.tipo === 'CLIENTE' ? '/client/home' : '/professional/home'
      );
    }
  }, [usuario, loading, navigate]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container">
      <div className="welcome-card">
        <div className="logo">
          Servijá<span>.</span>
        </div>
        <h1>Boas-vindas a Servijá</h1>
        <p className="subtitle">Encontre profissionais perto de você</p>
        <div className="button-group">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/cadastro')}
          >
            Criar conta
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/login')}
          >
            Entrar
          </button>
        </div>
        <button
          className="professional-link"
          onClick={() => showToast('👨‍🔧 Área para prestadores em breve')}
        >
          <i className="fas fa-briefcase"></i> Sou profissional{' '}
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.isError ? 'error' : 'success'}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
