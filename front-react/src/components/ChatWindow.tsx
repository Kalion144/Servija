import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  obterConversa,
  enviarMensagemChat,
  contratarProfissional,
  concluirConversa,
} from '../services/api';
import type { ChatMessage, Conversation, ConversationStatus } from '../lib/types';

interface ChatWindowProps {
  conversationId: number;
  isProfessional: boolean;
  onBack?: () => void;
  onStatusChange?: () => void;
}

const STATUS_LABELS: Record<ConversationStatus, string> = {
  ABERTA: 'Aberta',
  EM_NEGOCIACAO: 'Em negociação',
  CONTRATADA: 'Contratada',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  isProfessional,
  onBack,
  onStatusChange,
}) => {
  const { usuario } = useAuth();
  const [conversa, setConversa] = useState<Conversation | null>(null);
  const [mensagens, setMensagens] = useState<ChatMessage[]>([]);
  const [texto, setTexto] = useState('');
  const [ofertaValor, setOfertaValor] = useState('');
  const [ofertaMsg, setOfertaMsg] = useState('');
  const [showOferta, setShowOferta] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const carregar = async () => {
    try {
      const data = await obterConversa(conversationId, isProfessional);
      setConversa(data.conversa);
      setMensagens(data.mensagens || []);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar chat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    carregar();
    const interval = setInterval(carregar, 8000);
    return () => clearInterval(interval);
  }, [conversationId, isProfessional]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const encerrada =
    conversa?.status === 'CONCLUIDA' || conversa?.status === 'CANCELADA';

  const podeContratar =
    !isProfessional &&
    conversa &&
    ['ABERTA', 'EM_NEGOCIACAO'].includes(conversa.status);

  const podeConcluir =
    conversa && ['CONTRATADA', 'EM_ANDAMENTO'].includes(conversa.status);

  const handleEnviarTexto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || sending || encerrada) return;
    setSending(true);
    try {
      await enviarMensagemChat(
        conversationId,
        { conteudo: texto.trim(), tipo: 'texto' },
        isProfessional,
      );
      setTexto('');
      await carregar();
      onStatusChange?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar');
    } finally {
      setSending(false);
    }
  };

  const handleEnviarOferta = async () => {
    if (!ofertaValor || sending || encerrada) return;
    setSending(true);
    try {
      const valor = Number(ofertaValor);
      const conteudo =
        ofertaMsg.trim() ||
        `Oferta de R$ ${valor.toFixed(2)} para realizar o serviço.`;
      await enviarMensagemChat(
        conversationId,
        {
          conteudo,
          tipo: 'oferta',
          metadata: { valor, negociavel: true },
        },
        isProfessional,
      );
      setShowOferta(false);
      setOfertaValor('');
      setOfertaMsg('');
      await carregar();
      onStatusChange?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar oferta');
    } finally {
      setSending(false);
    }
  };

  const handleContratar = async () => {
    if (!window.confirm('Contratar este profissional com a última oferta?'))
      return;
    setSending(true);
    try {
      await contratarProfissional(conversationId);
      await carregar();
      onStatusChange?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao contratar');
    } finally {
      setSending(false);
    }
  };

  const handleConcluir = async () => {
    if (!window.confirm('Marcar o serviço como concluído?')) return;
    setSending(true);
    try {
      await concluirConversa(conversationId, isProfessional);
      await carregar();
      onStatusChange?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao concluir');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="chat-loading">Carregando conversa...</div>;
  }

  const servico = conversa?.servico;

  return (
    <div className="chat-window">
      <div className="chat-header">
        {onBack && (
          <button type="button" className="chat-back" onClick={onBack}>
            <i className="fas fa-arrow-left" />
          </button>
        )}
        <div className="chat-header-info">
          <h3>{servico?.titulo || conversa?.servico_titulo || 'Conversa'}</h3>
          <span className={`chat-status status-${conversa?.status}`}>
            {conversa?.status ? STATUS_LABELS[conversa.status] : ''}
          </span>
        </div>
        <div className="chat-actions">
          {podeContratar && (
            <button
              type="button"
              className="btn-contratar"
              onClick={handleContratar}
              disabled={sending}
            >
              Contratar
            </button>
          )}
          {podeConcluir && (
            <button
              type="button"
              className="btn-concluir"
              onClick={handleConcluir}
              disabled={sending}
            >
              Concluir
            </button>
          )}
        </div>
      </div>

      {error && <div className="chat-error">{error}</div>}

      <div className="chat-messages">
        {mensagens.map((msg) => {
          const isMine = msg.sender_id === usuario?.id;
          const isSistema = msg.tipo === 'sistema';

          if (isSistema) {
            return (
              <div key={msg.id} className="msg-sistema">
                {msg.conteudo}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`msg-bubble ${isMine ? 'mine' : 'theirs'} ${msg.tipo === 'oferta' ? 'oferta' : ''}`}
            >
              {!isMine && (
                <span className="msg-sender">{msg.sender_nome}</span>
              )}
              {msg.tipo === 'oferta' && msg.metadata?.valor != null && (
                <div className="oferta-valor">
                  R$ {Number(msg.metadata.valor).toFixed(2)}
                </div>
              )}
              <p>{msg.conteudo}</p>
              <span className="msg-time">
                {new Date(msg.created_at).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {!encerrada && (
        <div className="chat-input-area">
          {isProfessional && (
            <>
              <button
                type="button"
                className="btn-oferta-toggle"
                onClick={() => setShowOferta(!showOferta)}
              >
                <i className="fas fa-tag" /> Enviar oferta
              </button>
              {showOferta && (
                <div className="oferta-form">
                  <input
                    type="number"
                    placeholder="Valor (R$)"
                    value={ofertaValor}
                    onChange={(e) => setOfertaValor(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                  <input
                    type="text"
                    placeholder="Mensagem da oferta (opcional)"
                    value={ofertaMsg}
                    onChange={(e) => setOfertaMsg(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleEnviarOferta}
                    disabled={sending || !ofertaValor}
                  >
                    Enviar oferta
                  </button>
                </div>
              )}
            </>
          )}
          <form onSubmit={handleEnviarTexto} className="chat-form">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              disabled={sending}
            />
            <button type="submit" disabled={sending || !texto.trim()}>
              <i className="fas fa-paper-plane" />
            </button>
          </form>
        </div>
      )}

      {encerrada && (
        <div className="chat-closed">Esta conversa foi encerrada.</div>
      )}

      <style>{`
        .chat-window { display: flex; flex-direction: column; height: 100%; min-height: 480px; background: #f8fafc; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; }
        .chat-loading { padding: 2rem; text-align: center; color: #64748b; }
        .chat-header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; background: white; border-bottom: 1px solid #e2e8f0; }
        .chat-back { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; color: #475569; }
        .chat-header-info { flex: 1; min-width: 0; }
        .chat-header-info h3 { font-size: 1rem; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .chat-status { font-size: 0.75rem; color: #64748b; }
        .chat-actions { display: flex; gap: 8px; }
        .btn-contratar { background: #16a34a; color: white; border: none; padding: 8px 14px; border-radius: 20px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
        .btn-concluir { background: #2563eb; color: white; border: none; padding: 8px 14px; border-radius: 20px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
        .chat-error { background: #fef2f2; color: #dc2626; padding: 8px 16px; font-size: 0.85rem; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .msg-sistema { text-align: center; font-size: 0.8rem; color: #64748b; background: #f1f5f9; padding: 6px 12px; border-radius: 12px; align-self: center; max-width: 90%; }
        .msg-bubble { max-width: 75%; padding: 10px 14px; border-radius: 16px; font-size: 0.9rem; }
        .msg-bubble.mine { align-self: flex-end; background: #3b82f6; color: white; border-bottom-right-radius: 4px; }
        .msg-bubble.theirs { align-self: flex-start; background: white; color: #1e293b; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px; }
        .msg-bubble.oferta { border: 2px solid #f59e0b; }
        .msg-bubble.oferta.mine { background: #1d4ed8; }
        .oferta-valor { font-size: 1.2rem; font-weight: 800; margin-bottom: 4px; }
        .msg-sender { font-size: 0.7rem; font-weight: 600; opacity: 0.8; display: block; margin-bottom: 2px; }
        .msg-time { font-size: 0.65rem; opacity: 0.7; display: block; margin-top: 4px; text-align: right; }
        .chat-input-area { padding: 12px 16px; background: white; border-top: 1px solid #e2e8f0; }
        .btn-oferta-toggle { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; padding: 8px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; cursor: pointer; margin-bottom: 8px; }
        .oferta-form { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
        .oferta-form input { flex: 1; min-width: 120px; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 12px; }
        .oferta-form button { background: #f97316; color: white; border: none; padding: 8px 16px; border-radius: 12px; font-weight: 600; cursor: pointer; }
        .chat-form { display: flex; gap: 8px; }
        .chat-form input { flex: 1; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 24px; font-size: 0.9rem; }
        .chat-form button { width: 44px; height: 44px; border-radius: 50%; border: none; background: #3b82f6; color: white; cursor: pointer; }
        .chat-closed { text-align: center; padding: 16px; color: #64748b; background: #f1f5f9; font-size: 0.9rem; }
      `}</style>
    </div>
  );
};

export default ChatWindow;
