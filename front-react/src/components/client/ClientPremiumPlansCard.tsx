import React, { useState } from 'react';
import type { PlanId } from '../../services/api';

interface ClientPremiumPlansCardProps {
  currentPlan?: PlanId;
  onSubscribe: (plan: PlanId, preco: number) => void | Promise<void>;
}

const planos = [
  {
    id: 'FREE' as PlanId,
    nome: 'Free',
    emoji: '👤',
    preco: 0,
    precoLabel: 'Grátis',
    beneficios: ['3 serviços abertos', 'Busca de profissionais'],
  },
  {
    id: 'PRO' as PlanId,
    nome: 'Pro',
    emoji: '💼',
    preco: 59.99,
    precoLabel: 'R$ 59,99',
    beneficios: ['10 serviços abertos', 'Prioridade na busca', 'Suporte prioritário'],
  },
  {
    id: 'PREMIUM' as PlanId,
    nome: 'Premium',
    emoji: '💎',
    preco: 129.99,
    precoLabel: 'R$ 129,99',
    popular: true,
    beneficios: ['Serviços ilimitados', 'Tudo do Pro', 'Destaque premium'],
  },
];

const planLabels: Record<PlanId, string> = { FREE: 'Free', PRO: 'Pro', PREMIUM: 'Premium' };

const css = `
  .cppc-card {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 24px;
    padding: 22px;
    color: white;
    cursor: pointer;
    box-shadow: 0 8px 32px rgba(37,99,235,0.35);
    transition: transform 0.2s, box-shadow 0.2s;
    user-select: none;
  }
  .cppc-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(37,99,235,0.4); }
  .cppc-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .cppc-title { font-size: 17px; font-weight: 800; letter-spacing: -0.3px; display: flex; align-items: center; gap: 8px; }
  .cppc-header-right { display: flex; align-items: center; gap: 10px; }
  .cppc-badge {
    background: rgba(255,255,255,0.22);
    border: 1px solid rgba(255,255,255,0.35);
    padding: 4px 13px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }
  .cppc-chevron { font-size: 13px; transition: transform 0.3s; flex-shrink: 0; opacity: 0.9; }
  .cppc-chevron.open { transform: rotate(180deg); }
  .cppc-tagline { margin-top: 10px; font-size: 13px; opacity: 0.85; line-height: 1.4; }

  .cppc-plans { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }

  .cppc-plan {
    background: white;
    border-radius: 16px;
    padding: 16px 16px 14px;
    cursor: default;
    position: relative;
    border: 2px solid transparent;
    transition: box-shadow 0.2s, border-color 0.2s;
  }
  .cppc-plan:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.12); }
  .cppc-plan.is-current { border-color: #22c55e; }
  .cppc-plan.is-premium-plan { border-color: rgba(124,58,237,0.35); }

  .cppc-popular {
    position: absolute;
    top: -11px;
    right: 14px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 5px;
    box-shadow: 0 2px 8px rgba(245,158,11,0.45);
  }

  .cppc-plan-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .cppc-plan-name { font-size: 15px; font-weight: 800; color: #111827; display: flex; align-items: center; gap: 7px; }
  .cppc-plan-emoji { font-size: 15px; }

  .cppc-price-block { text-align: right; }
  .cppc-price-amount { font-size: 20px; font-weight: 800; color: #111827; line-height: 1; }
  .cppc-price-period { font-size: 11px; color: #9ca3af; margin-top: 2px; }

  .cppc-benefits { list-style: none; padding: 0; margin: 0 0 13px; }
  .cppc-benefits li {
    font-size: 12.5px;
    color: #374151;
    padding: 3px 0;
    display: flex;
    align-items: center;
    gap: 7px;
    line-height: 1.4;
  }
  .cppc-check { color: #16a34a; font-size: 11px; flex-shrink: 0; }

  .cppc-btn {
    width: 100%;
    padding: 10px 12px;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    letter-spacing: 0.1px;
  }
  .cppc-btn:disabled { opacity: 0.65; cursor: default !important; transform: none !important; box-shadow: none !important; }

  .cppc-btn-current { background: #f0fdf4; color: #15803d; border: 1.5px solid #86efac; cursor: default; }
  .cppc-btn-free { background: #f9fafb; color: #9ca3af; border: 1.5px solid #e5e7eb; cursor: default; }
  .cppc-btn-pro {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    box-shadow: 0 3px 10px rgba(59,130,246,0.3);
  }
  .cppc-btn-pro:hover:not(:disabled) {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    transform: translateY(-1px);
    box-shadow: 0 5px 14px rgba(59,130,246,0.45);
  }
  .cppc-btn-premium {
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
    color: white;
    box-shadow: 0 3px 10px rgba(124,58,237,0.3);
  }
  .cppc-btn-premium:hover:not(:disabled) {
    background: linear-gradient(135deg, #6d28d9, #5b21b6);
    transform: translateY(-1px);
    box-shadow: 0 5px 14px rgba(124,58,237,0.45);
  }

  @keyframes cppc-spin { to { transform: rotate(360deg); } }
  .cppc-spinner {
    display: inline-block;
    width: 13px;
    height: 13px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: cppc-spin 0.7s linear infinite;
  }
`;

const ClientPremiumPlansCard: React.FC<ClientPremiumPlansCardProps> = ({
  currentPlan = 'FREE',
  onSubscribe,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  const isCurrent = (planId: PlanId) => currentPlan === planId;

  const handleAssinar = async (e: React.MouseEvent, plano: typeof planos[0]) => {
    e.stopPropagation();
    if (loadingPlan || isCurrent(plano.id) || plano.preco === 0) return;
    setLoadingPlan(plano.id);
    try {
      await onSubscribe(plano.id, plano.preco);
    } finally {
      setLoadingPlan(null);
    }
  };

  const getBtnClass = (plano: typeof planos[0]) => {
    if (isCurrent(plano.id)) return 'cppc-btn cppc-btn-current';
    if (plano.id === 'FREE') return 'cppc-btn cppc-btn-free';
    if (plano.id === 'PRO') return 'cppc-btn cppc-btn-pro';
    return 'cppc-btn cppc-btn-premium';
  };

  const getBtnContent = (plano: typeof planos[0]) => {
    if (loadingPlan === plano.id) {
      return <><span className="cppc-spinner" /> Redirecionando...</>;
    }
    if (isCurrent(plano.id)) return <><i className="fas fa-check" /> Plano atual</>;
    if (plano.id === 'FREE') return 'Plano gratuito';
    return `Assinar ${plano.nome}`;
  };

  return (
    <>
      <style>{css}</style>
      <div className="cppc-card" onClick={() => setExpanded((prev) => !prev)}>
        <div className="cppc-header">
          <div className="cppc-title">💎 Planos Cliente</div>
          <div className="cppc-header-right">
            <div className="cppc-badge">{planLabels[currentPlan]}</div>
            <i className={`fas fa-chevron-down cppc-chevron${expanded ? ' open' : ''}`} />
          </div>
        </div>

        {!expanded && (
          <div className="cppc-tagline">
            Publique mais serviços e encontre os melhores profissionais!
          </div>
        )}

        {expanded && (
          <div className="cppc-plans">
            {planos.map((plano) => (
              <div
                key={plano.id}
                className={[
                  'cppc-plan',
                  isCurrent(plano.id) ? 'is-current' : '',
                  plano.id === 'PREMIUM' ? 'is-premium-plan' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={(e) => e.stopPropagation()}
              >
                {plano.popular && (
                  <div className="cppc-popular">
                    <i className="fas fa-crown" /> Popular
                  </div>
                )}

                <div className="cppc-plan-row">
                  <div className="cppc-plan-name">
                    <span className="cppc-plan-emoji">{plano.emoji}</span>
                    {plano.nome}
                  </div>
                  <div className="cppc-price-block">
                    <div className="cppc-price-amount">{plano.precoLabel}</div>
                    {plano.preco > 0 && <div className="cppc-price-period">/mês</div>}
                  </div>
                </div>

                <ul className="cppc-benefits">
                  {plano.beneficios.map((b, i) => (
                    <li key={i}>
                      <i className="fas fa-check-circle cppc-check" /> {b}
                    </li>
                  ))}
                </ul>

                <button
                  className={getBtnClass(plano)}
                  disabled={isCurrent(plano.id) || plano.id === 'FREE' || loadingPlan !== null}
                  onClick={(e) => handleAssinar(e, plano)}
                >
                  {getBtnContent(plano)}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ClientPremiumPlansCard;
