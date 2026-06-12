import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingRouteProps {
  children: React.ReactNode;
  allowedType: 'CLIENTE' | 'PROFISSIONAL';
}

export default function OnboardingRoute({ children, allowedType }: OnboardingRouteProps) {
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

  if (!usuario.perfilIncompleto) {
    return (
      <Navigate
        to={allowedType === 'CLIENTE' ? '/client/home' : '/professional/home'}
        replace
      />
    );
  }

  return <>{children}</>;
}
