import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ToastState } from '../lib/types';

export default function LoginUser() {
  const navigate = useNavigate();
  const { login, usuario } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<ToastState | null>(null);

  const validate = () => {
    let newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'E-mail obrigatório';
    else if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email))
      newErrors.email = 'E-mail inválido';
    if (!password) newErrors.password = 'Senha obrigatória';
    else if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      const usuarioLogado = await login(email, password);

      setToast({
        message: 'Login realizado com sucesso',
        isError: false,
      });

      setTimeout(() => {
        if (usuarioLogado?.tipo === 'CLIENTE') {
          navigate('/client/home');
        } else if (usuarioLogado?.tipo === 'PROFISSIONAL') {
          navigate('/professional/home');
        }
      }, 1000);
    } catch (error) {
      console.log(error);

      setTimeout(() => {
        setToast({
          message: 'Erro ao conectar ao servidor',
          isError: true,
        });
      }, 1500);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            Servijá<span>.</span>
          </div>
          <h2>Entrar</h2>
          <p>Digite seu e-mail e senha para acessar sua conta</p>
        </div>
        <div className="input-icon">
          <i className="fas fa-envelope"></i>
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {errors.email && <div className="error-message">{errors.email}</div>}
        <div className="input-icon">
          <i className="fas fa-lock"></i>
          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {errors.password && (
          <div className="error-message">{errors.password}</div>
        )}
        <div className="login-options">
          <a
            href="#"
            className="forgot-link"
            onClick={(e) => {
              e.preventDefault();
              setToast({
                message: '🔐 Instruções enviadas para seu e-mail',
                isError: false,
              });
            }}
          >
            Esqueceu a senha?
          </a>
        </div>
        <button className="login-btn" onClick={handleLogin}>
          <i className="fas fa-arrow-right-to-bracket"></i> Entrar
        </button>
        <div className="divider">
          <hr />
          <span>ou</span>
          <hr />
        </div>
        <button
          className="google-btn"
          onClick={() =>
            setToast({ message: 'Login com Google em breve', isError: false })
          }
        >
          <i className="fab fa-google"></i> Continuar com Google
        </button>
        <div className="register-link">
          Não tem uma conta?{' '}
          <a
            href="/cadastro"
            onClick={(e) => {
              e.preventDefault();
              navigate('/cadastro');
            }}
          >
            Criar conta
          </a>
        </div>
      </div>
      {toast && (
        <div
          className="success-toast"
          style={{ background: toast.isError ? '#dc2626' : '#f97316' }}
        >
          <i
            className={`fas ${toast.isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}
          ></i>{' '}
          {toast.message}
        </div>
      )}
    </div>
  );
}
