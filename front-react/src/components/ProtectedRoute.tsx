import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CompleteProfileModal from './CompleteProfileModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedType: 'CLIENTE' | 'PROFISSIONAL';
}

function isProfileComplete(usuario: any) {
  if (!usuario) return false;
  // Check if at least some basic info is filled
  return usuario.telefone && usuario.cpf && usuario.endereco && usuario.cidade && usuario.estado;
}

export default function ProtectedRoute({ children, allowedType }: ProtectedRouteProps) {
  const { usuario, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (usuario && usuario.tipo === allowedType && !isProfileComplete(usuario)) {
      setShowModal(true);
    }
  }, [usuario, allowedType]);

  if (loading) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>Carregando...</div>;
  }

  if (!usuario) {
    return <Navigate to={allowedType === 'CLIENTE' ? '/client/login' : '/professional/login'} replace />;
  }

  if (usuario.tipo !== allowedType) {
    return <Navigate to={usuario.tipo === 'CLIENTE' ? '/client/home' : '/professional/home'} replace />;
  }

  return (
    <>
      {children}
      <CompleteProfileModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
