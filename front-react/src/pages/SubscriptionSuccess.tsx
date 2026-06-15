import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmarAssinatura } from '../services/api';

interface SubscriptionSuccessProps {
  userType: 'CLIENTE' | 'PROFISSIONAL';
}

const SubscriptionSuccess: React.FC<SubscriptionSuccessProps> = ({ userType }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const isProfessional = userType === 'PROFISSIONAL';
  const homePath = isProfessional ? '/professional/home' : '/client/home';
  const accent = isProfessional ? '#f97316' : '#3b82f6';

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setStatus('error');
      setMessage('Sessão de pagamento não encontrada.');
      return;
    }

    confirmarAssinatura(sessionId, isProfessional)
      .then((data) => {
        setStatus('success');
        setMessage(
          data.mensagem ?? `Plano ${data.plan ?? ''} ativado com sucesso!`,
        );
      })
      .catch((err) => {
        setStatus('error');
        setMessage(
          err instanceof Error ? err.message : 'Erro ao confirmar assinatura',
        );
      });
  }, [searchParams, isProfessional]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isProfessional ? '#fff7ed' : '#f0f4fa',
        padding: '24px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px 32px',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        }}
      >
        {status === 'loading' && (
          <>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: accent }}></i>
            <p style={{ marginTop: '16px', color: '#64748b' }}>Confirmando pagamento...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <i className="fas fa-check-circle" style={{ fontSize: '3rem', color: '#16a34a' }}></i>
            <h2 style={{ marginTop: '16px', color: '#0f172a' }}>Assinatura confirmada!</h2>
            <p style={{ color: '#64748b', marginTop: '8px' }}>{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <i className="fas fa-times-circle" style={{ fontSize: '3rem', color: '#dc2626' }}></i>
            <h2 style={{ marginTop: '16px', color: '#0f172a' }}>Não foi possível confirmar</h2>
            <p style={{ color: '#64748b', marginTop: '8px' }}>{message}</p>
          </>
        )}
        <button
          onClick={() => navigate(homePath)}
          style={{
            marginTop: '24px',
            background: accent,
            color: 'white',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '40px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Voltar ao início
        </button>
      </div>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
};

export default SubscriptionSuccess;
