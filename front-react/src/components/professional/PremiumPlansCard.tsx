import React, { useState } from 'react';
import type { PlanId } from '../../services/api';

interface PremiumPlansCardProps {
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
    beneficios: ['3 clientes por dia', 'Perfil público'],
  },
  {
    id: 'PRO' as PlanId,
    nome: 'Pro',
    emoji: '💼',
    preco: 59.99,
    precoLabel: 'R$ 59,99',
    beneficios: ['10 clientes/dia', 'Chat em tempo real', 'Impulso de ranking', 'Verificado'],
  },
  {
    id: 'PREMIUM' as PlanId,
    nome: 'Premium',
    emoji: '💎',
    preco: 129.99,
    precoLabel: 'R$ 129,99',
    popular: true,
    beneficios: ['Clientes ilimitados', 'Tudo do Pro', 'Clientes premium'],
  },
];

const planLabels: Record<PlanId, string> = { FREE: 'Free', PRO: 'Pro', PREMIUM: 'Premium' };

const css = `
  .ppc-card {
    background: linear-gradient(135deg, #f97316 0%, #c2410c 100%);
    border-radius: 24px;
    padding: 22px;
    color: white;
    cursor: pointer;
    box-shadow: 0 8px 32px rgba(234,88,12,0.35);
    transition: transform 0.2s, box-shadow 0.2s;
    user-select: none;
  }
  .ppc-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(234,88,12,0.4); }
  .ppc-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .ppc-title { font-size: 17px; font-weight: 800; letter-spacing: -0.3px; display: flex; align-items: center; gap: 8px; }
  .ppc-header-right { display: flex; align-items: center; gap: 10px; }
  .ppc-badge {
    background: rgba(255,255,255,0.22);
    border: 1px solid rgba(255,255,255,0.35);
    padding: 4px 13px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }
  .ppc-chevron { font-size: 13px; transition: transform 0.3s; flex-shrink: 0; opacity: 0.9; }
  .ppc-chevron.open { transform: rotate(180deg); }
  .ppc-tagline { margin-top: 10px; font-size: 13px; opacity: 0.85; line-height: 1.4; }

  .ppc-plans { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }

  .ppc-plan {
    background: white;
    border-radius: 16px;
    padding: 16px 16px 14px;
    cursor: default;
    position: relative;
    border: 2px solid transparent;
    transition: box-shadow 0.2s, border-color 0.2s;
  }
  .ppc-plan:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.12); }
  .ppc-plan.is-current { border-color: #22c55e; }
  .ppc-plan.is-premium-plan { border-color: rgba(124,58,237,0.35); }

  .ppc-popular {
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

  .ppc-plan-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .ppc-plan-name { font-size: 15px; font-weight: 800; color: #111827; display: flex; align-items: center; gap: 7px; }
  .ppc-plan-emoji { font-size: 15px; }

  .ppc-price-block { text-align: right; }
  .ppc-price-amount { font-size: 20px; font-weight: 800; color: #111827; line-height: 1; }
  .ppc-price-period { font-size: 11px; color: #9ca3af; margin-top: 2px; }

  .ppc-benefits { list-style: none; padding: 0; margin: 0 0 13px; }
  .ppc-benefits li {
    font-size: 12.5px;
    color: #374151;
    padding: 3px 0;
    display: flex;
    align-items: center;
    gap: 7px;
    line-height: 1.4;
  }
  .ppc-check { color: #16a34a; font-size: 11px; flex-shrink: 0; }

  .ppc-btn {
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
  .ppc-btn:disabled { opacity: 0.65; cursor: default !important; transform: none !important; box-shadow: none !important; }

  .ppc-btn-current { background: #f0fdf4; color: #15803d; border: 1.5px solid #86efac; cursor: default; }
  .ppc-btn-free { background: #f9fafb; color: #9ca3af; border: 1.5px solid #e5e7eb; cursor: default; }
  .ppc-btn-pro {
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: white;
    box-shadow: 0 3px 10px rgba(249,115,22,0.3);
  }
  .ppc-btn-pro:hover:not(:disabled) {
    background: linear-gradient(135deg, #ea580c, #c2410c);
    transform: translateY(-1px);
    box-shadow: 0 5px 14px rgba(249,115,22,0.45);
  }
  .ppc-btn-premium {
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
    color: white;
    box-shadow: 0 3px 10px rgba(124,58,237,0.3);
  }
  .ppc-btn-premium:hover:not(:disabled) {
    background: linear-gradient(135deg, #6d28d9, #5b21b6);
    transform: translateY(-1px);
    box-shadow: 0 5px 14px rgba(124,58,237,0.45);
  }

  @keyframes ppc-spin { to { transform: rotate(360deg); } }
  .ppc-spinner {
    display: inline-block;
    width: 13px;
    height: 13px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: ppc-spin 0.7s linear infinite;
  }
`;

const PremiumPlansCard: React.FC<PremiumPlansCardProps> = ({
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
    if (isCurrent(plano.id)) return 'ppc-btn ppc-btn-current';
    if (plano.id === 'FREE') return 'ppc-btn ppc-btn-free';
    if (plano.id === 'PRO') return 'ppc-btn ppc-btn-pro';
    return 'ppc-btn ppc-btn-premium';
  };

  const getBtnContent = (plano: typeof planos[0]) => {
    if (loadingPlan === plano.id) {
      return <><span className="ppc-spinner" /> Redirecionando...</>;
    }
    if (isCurrent(plano.id)) return <><i className="fas fa-check" /> Plano atual</>;
    if (plano.id === 'FREE') return 'Plano gratuito';
    return `Assinar ${plano.nome}`;
  };

  return (
    <>
      <style>{css}</style>
      <div className="ppc-card" onClick={() => setExpanded((prev) => !prev)}>
        <div className="ppc-header">
          <div className="ppc-title">💎 Premium Profissional</div>
          <div className="ppc-header-right">
            <div className="ppc-badge">{planLabels[currentPlan]}</div>
            <i className={`fas fa-chevron-down ppc-chevron${expanded ? ' open' : ''}`} />
          </div>
        </div>

        {!expanded && (
          <div className="ppc-tagline">
            Ganhe destaque nos resultados de busca e conquiste mais clientes!
          </div>
        )}

        {expanded && (
          <div className="ppc-plans">
            {planos.map((plano) => (
              <div
                key={plano.id}
                className={[
                  'ppc-plan',
                  isCurrent(plano.id) ? 'is-current' : '',
                  plano.id === 'PREMIUM' ? 'is-premium-plan' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={(e) => e.stopPropagation()}
              >
                {plano.popular && (
                  <div className="ppc-popular">
                    <i className="fas fa-crown" /> Popular
                  </div>
                )}

                <div className="ppc-plan-row">
                  <div className="ppc-plan-name">
                    <span className="ppc-plan-emoji">{plano.emoji}</span>
                    {plano.nome}
                  </div>
                  <div className="ppc-price-block">
                    <div className="ppc-price-amount">{plano.precoLabel}</div>
                    {plano.preco > 0 && <div className="ppc-price-period">/mês</div>}
                  </div>
                </div>

                <ul className="ppc-benefits">
                  {plano.beneficios.map((b, i) => (
                    <li key={i}>
                      <i className="fas fa-check-circle ppc-check" /> {b}
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

export default PremiumPlansCard;
