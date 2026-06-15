import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedType: 'CLIENTE' | 'PROFISSIONAL';
}

export default function ProtectedRoute({ children, allowedType }: ProtectedRouteProps) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="onboarding-loading">Carregando...</div>
    );
  }

  if (!usuario) {
    return (
      <Navigate
        to={allowedType === 'CLIENTE' ? '/client/login' : '/professional/login'}
        replace
      />
    );
  }

  if (usuario.tipo !== allowedType) {
    return (
      <Navigate
        to={usuario.tipo === 'CLIENTE' ? '/client/home' : '/professional/home'}
        replace
      />
    );
  }

  if (usuario.perfilIncompleto) {
    return (
      <Navigate
        to={allowedType === 'CLIENTE' ? '/client/onboarding' : '/professional/onboarding'}
        replace
      />
    );
  }

  return <>{children}</>;
}
