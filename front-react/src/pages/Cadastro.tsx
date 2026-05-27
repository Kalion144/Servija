import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Errors, Toast } from '../lib/types';

export default function Cadastro() {
  const navigate = useNavigate();
  const { cadastrar } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {}, []);

  const validateName = () => {
    if (!fullName.trim()) return 'Nome completo é obrigatório.';
    if (fullName.trim().length < 3)
      return 'Nome deve ter pelo menos 3 caracteres.';
    return '';
  };

  const validateEmail = () => {
    const pattern = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;

    if (!email.trim()) return 'E-mail é obrigatório.';
    if (!pattern.test(email)) return 'Insira um e-mail válido.';

    return '';
  };

  const validatePassword = () => {
    if (!password) return 'Senha é obrigatória.';
    if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';

    return '';
  };

  const validateUserType = () => {
    if (!userType) return 'Selecione um tipo de cadastro.';

    return '';
  };

  const handleSubmit = async () => {
    const nameErr = validateName();
    const emailErr = validateEmail();
    const passErr = validatePassword();
    const typeErr = validateUserType();

    setErrors({
      name: nameErr,
      email: emailErr,
      password: passErr,
      userType: typeErr,
    });

    if (!nameErr && !emailErr && !passErr && !typeErr) {
      try {
        await cadastrar({
          nome: fullName,
          email,
          senha: password,
          tipo: userType === 'CLIENTE' ? 'CLIENTE' : 'PROFISSIONAL',
        });

        setToast({
          msg: 'Cadastro realizado com sucesso!',
          isError: false,
        });

        setTimeout(() => {
          navigate(
            userType === 'CLIENTE' ? '/client/home' : '/professional/home'
          );
        }, 1500);
      } catch (error) {
        console.log(error);

        setToast({
          msg: 'Erro ao conectar com servidor',
          isError: true,
        });
      }

      setTimeout(() => setToast(null), 3000);
    } else {
      setToast({
        msg: 'Preencha todos os campos corretamente',
        isError: true,
      });

      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="register-card">
      <div className="form-container">
        <h1>Cadastro</h1>

        <div className="input-group">
          <label>
            <i className="fas fa-user"></i> Nome Completo{' '}
            <span className="required-star">*</span>
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Digite seu nome completo"
          />

          {errors.name && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> {errors.name}
            </div>
          )}
        </div>

        <div className="input-group">
          <label>
            <i className="fas fa-envelope"></i> E-mail{' '}
            <span className="required-star">*</span>
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu e-mail"
          />

          {errors.email && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> {errors.email}
            </div>
          )}
        </div>

        <div className="input-group">
          <label>
            <i className="fas fa-lock"></i> Senha{' '}
            <span className="required-star">*</span>
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Crie uma senha"
          />

          <div className="hint-requirement">
            <i className="fas fa-key"></i>
            <span> Mínimo 8 caracteres</span>
          </div>

          {errors.password && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> {errors.password}
            </div>
          )}
        </div>

        <div className="radio-group">
          <div className="radio-label-title">
            <i className="fas fa-briefcase"></i> Tipo de Cadastro{' '}
            <span className="required-star">*</span>
          </div>

          <div className="radio-options">
            <div
              className={`radio-card ${userType === 'Cliente' ? 'selected' : ''}`}
              onClick={() => setUserType('Cliente')}
            >
              <input
                type="radio"
                name="userType"
                checked={userType === 'Cliente'}
                readOnly
              />

              <span>Cliente</span>
            </div>

            <div
              className={`radio-card ${userType === 'Prestador de serviços' ? 'selected' : ''}`}
              onClick={() => setUserType('Prestador de serviços')}
            >
              <input
                type="radio"
                name="userType"
                checked={userType === 'Prestador de serviços'}
                readOnly
              />

              <span>Prestador de serviços</span>
            </div>
          </div>

          {errors.userType && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> {errors.userType}
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button
            className="btn btn-outline"
            onClick={() => {
              setFullName('');
              setEmail('');
              setPassword('');
              setUserType('');
              setErrors({});
            }}
          >
            Cancelar
          </button>

          <button className="btn btn-primary" onClick={handleSubmit}>
            Cadastrar
          </button>
        </div>

        <hr />

        <small className="note">* campos obrigatórios</small>
      </div>

      {toast && (
        <div
          className="success-toast"
          style={{
            background: toast.isError ? '#dc2626' : '#f97316',
          }}
        >
          <i
            className={`fas ${
              toast.isError ? 'fa-exclamation-triangle' : 'fa-check-circle'
            }`}
          ></i>{' '}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
