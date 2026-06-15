import React, { useState } from 'react';
import type { PlanId } from '../../services/api';

interface Plano {
  id: PlanId;
  nome: string;
  preco: number;
  precoLabel: string;
  icone: string;
  variante: string;
  popular?: boolean;
  beneficios: string[];
}

interface PremiumPlansCardProps {
  currentPlan?: PlanId;
  onSubscribe: (plan: PlanId, preco: number) => void;
}

const planos: Plano[] = [
  {
    id: 'FREE',
    nome: 'Free',
    preco: 0,
    precoLabel: 'Grátis',
    icone: 'fa-user',
    variante: 'inner-free',
    beneficios: ['3 clientes por dia', 'Perfil público'],
  },
  {
    id: 'PRO',
    nome: 'Pro',
    preco: 59.99,
    precoLabel: 'R$ 59,99',
    icone: 'fa-briefcase',
    variante: 'inner-pro',
    beneficios: ['10 clientes/dia', 'Chat em tempo real', 'Impulso de ranking', 'Verificado'],
  },
  {
    id: 'PREMIUM',
    nome: 'Premium',
    preco: 129.99,
    precoLabel: 'R$ 129,99',
    icone: 'fa-gem',
    variante: 'inner-premium',
    popular: true,
    beneficios: ['Clientes ilimitados', 'Tudo do Pro', 'Clientes premium'],
  },
];

const PremiumPlansCard: React.FC<PremiumPlansCardProps> = ({
  currentPlan = 'FREE',
  onSubscribe,
}) => {
  const [planosAbertos, setPlanosAbertos] = useState(false);

  const togglePlanos = () => setPlanosAbertos((prev) => !prev);

  const handleAssinar = (e: React.MouseEvent, plan: PlanId, preco: number) => {
    e.stopPropagation();
    onSubscribe(plan, preco);
  };

  const isCurrent = (planId: PlanId) =>
    currentPlan === planId ||
    (currentPlan === 'FREE' && planId === 'FREE');

  return (
    <div
      className="announcement-card"
      style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
      onClick={togglePlanos}
    >
      <div className="premium-card-header">
        <h4>
          <i className="fas fa-gem"></i> 💼 Premium Profissional
        </h4>
        <i
          className={`fas fa-chevron-down premium-toggle-icon${planosAbertos ? ' open' : ''}`}
        ></i>
      </div>

      {!planosAbertos && (
        <div className="premium-collapsed-info">
          <p>Ganhe destaque nos resultados de busca!</p>
          <div className="announcement-subtext">
            Plano atual: <strong>{currentPlan}</strong>
          </div>
        </div>
      )}

      {planosAbertos && (
        <div className="plans-expanded">
          {planos.map((plano) => (
            <div
              key={plano.id}
              className={`inner-plan ${plano.variante}`}
              onClick={(e) => e.stopPropagation()}
            >
              {plano.popular && (
                <div className="inner-plan-badge">
                  <i className="fas fa-crown"></i> Popular
                </div>
              )}
              <div className="inner-plan-top">
                <div className="inner-plan-nome">
                  <i className={`fas ${plano.icone}`}></i> {plano.nome}
                </div>
                <div>
                  <div className="inner-plan-preco">{plano.precoLabel}</div>
                  {plano.preco > 0 && <div className="inner-plan-preco-sub">/mês</div>}
                </div>
              </div>
              <ul className="inner-plan-beneficios">
                {plano.beneficios.map((beneficio, idx) => (
                  <li key={idx}>
                    <i className="fas fa-check-circle"></i> {beneficio}
                  </li>
                ))}
              </ul>
              <button
                className="inner-plan-btn"
                disabled={isCurrent(plano.id)}
                onClick={(e) => handleAssinar(e, plano.id, plano.preco)}
              >
                {isCurrent(plano.id)
                  ? 'Plano atual'
                  : plano.preco === 0
                    ? 'Plano gratuito'
                    : `Assinar ${plano.nome}`}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PremiumPlansCard;
