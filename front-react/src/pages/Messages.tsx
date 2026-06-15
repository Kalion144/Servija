import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listarConversas } from '../services/api';
import ChatWindow from '../components/ChatWindow';
import type { Conversation, ConversationStatus } from '../lib/types';

interface MessagesProps {
  userType: 'CLIENTE' | 'PROFISSIONAL';
}

const STATUS_LABELS: Record<ConversationStatus, string> = {
  ABERTA: 'Aberta',
  EM_NEGOCIACAO: 'Em negociação',
  CONTRATADA: 'Contratada',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

const Messages: React.FC<MessagesProps> = ({ userType }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { usuario, logout } = useAuth();
  const isProfessional = userType === 'PROFISSIONAL';
  const homePath = isProfessional ? '/professional/home' : '/client/home';

  const [conversas, setConversas] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    try {
      const data = await listarConversas(isProfessional);
      setConversas(data.conversas || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [isProfessional]);

  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) setSelectedId(Number(idParam));
  }, [searchParams]);

  const theme = isProfessional
    ? { accent: '#f97316', bg: '#fff7ed', border: '#fed7aa' }
    : { accent: '#3b82f6', bg: '#f0f4fa', border: '#e6eef8' };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: ${theme.bg}; min-height: 100vh; }
        .messages-page { max-width: 1100px; margin: 0 auto; padding: 20px; min-height: 100vh; }
        .messages-header { display: flex; justify-content: space-between; align-items: center; background: white; padding: 16px 24px; border-radius: 24px; margin-bottom: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); border: 1px solid ${theme.border}; }
        .messages-header h1 { font-size: 1.4rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 10px; }
        .header-actions { display: flex; gap: 10px; }
        .btn-nav { background: ${theme.bg}; border: 1px solid ${theme.border}; padding: 8px 16px; border-radius: 20px; font-weight: 600; cursor: pointer; color: #475569; font-size: 0.85rem; }
        .messages-layout { display: grid; grid-template-columns: 320px 1fr; gap: 16px; min-height: calc(100vh - 140px); }
        .conversations-list { background: white; border-radius: 20px; border: 1px solid ${theme.border}; overflow: hidden; display: flex; flex-direction: column; }
        .list-title { padding: 14px 16px; font-weight: 700; border-bottom: 1px solid #f1f5f9; color: #0f172a; }
        .conv-items { flex: 1; overflow-y: auto; }
        .conv-item { padding: 14px 16px; border-bottom: 1px solid #f8fafc; cursor: pointer; transition: background 0.15s; }
        .conv-item:hover, .conv-item.active { background: ${theme.bg}; }
        .conv-item h4 { font-size: 0.9rem; font-weight: 700; color: #0f172a; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .conv-item p { font-size: 0.8rem; color: #64748b; }
        .conv-status { display: inline-block; font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; background: #f1f5f9; color: #475569; margin-top: 4px; }
        .chat-panel { min-height: 520px; }
        .empty-chat { background: white; border-radius: 20px; border: 1px solid ${theme.border}; display: flex; align-items: center; justify-content: center; color: #94a3b8; min-height: 480px; flex-direction: column; gap: 12px; }
        .empty-list { padding: 24px; text-align: center; color: #94a3b8; font-size: 0.9rem; }
        @media (max-width: 768px) {
          .messages-layout { grid-template-columns: 1fr; }
          .conversations-list { max-height: 240px; }
          .chat-panel { display: ${selectedId ? 'block' : 'none'}; }
          .conversations-list { display: ${selectedId ? 'none' : 'flex'}; }
        }
      `}</style>

      <div className="messages-page">
        <div className="messages-header">
          <h1>
            <i className="fas fa-comments" style={{ color: theme.accent }} />
            Mensagens
          </h1>
          <div className="header-actions">
            <button className="btn-nav" onClick={() => navigate(homePath)}>
              <i className="fas fa-home" /> Home
            </button>
            <button className="btn-nav" onClick={() => logout()}>
              Sair
            </button>
          </div>
        </div>

        <div className="messages-layout">
          <div className="conversations-list">
            <div className="list-title">Conversas ({conversas.length})</div>
            <div className="conv-items">
              {loading && <div className="empty-list">Carregando...</div>}
              {!loading && conversas.length === 0 && (
                <div className="empty-list">
                  Nenhuma conversa ainda.
                  {isProfessional
                    ? ' Inicie uma conversa em um serviço disponível.'
                    : ' Aguarde profissionais entrarem em contato.'}
                </div>
              )}
              {conversas.map((c) => (
                <div
                  key={c.id}
                  className={`conv-item ${selectedId === c.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <h4>{c.servico_titulo}</h4>
                  <p>
                    {isProfessional ? 'Cliente' : 'Profissional'}: {c.outro_nome}
                  </p>
                  <span className="conv-status">
                    {STATUS_LABELS[c.status] || c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="chat-panel">
            {selectedId ? (
              <ChatWindow
                conversationId={selectedId}
                isProfessional={isProfessional}
                onBack={() => setSelectedId(null)}
                onStatusChange={carregar}
              />
            ) : (
              <div className="empty-chat">
                <i
                  className="fas fa-comment-dots"
                  style={{ fontSize: '3rem', opacity: 0.4 }}
                />
                <p>Selecione uma conversa para começar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />
    </>
  );
};

export default Messages;
