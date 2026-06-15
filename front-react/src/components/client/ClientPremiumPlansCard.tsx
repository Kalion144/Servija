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

interface ClientPremiumPlansCardProps {
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
    beneficios: ['3 serviços abertos', 'Busca de profissionais'],
  },
  {
    id: 'PRO',
    nome: 'Pro',
    preco: 59.99,
    precoLabel: 'R$ 59,99',
    icone: 'fa-briefcase',
    variante: 'inner-pro',
    beneficios: ['10 serviços abertos', 'Prioridade na busca', 'Suporte prioritário'],
  },
  {
    id: 'PREMIUM',
    nome: 'Premium',
    preco: 129.99,
    precoLabel: 'R$ 129,99',
    icone: 'fa-gem',
    variante: 'inner-premium',
    popular: true,
    beneficios: ['Serviços ilimitados', 'Tudo do Pro', 'Destaque premium'],
  },
];

const ClientPremiumPlansCard: React.FC<ClientPremiumPlansCardProps> = ({
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
      style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
      onClick={togglePlanos}
    >
      <div className="premium-card-header">
        <h4>
          <i className="fas fa-gem"></i> 💼 Planos Cliente
        </h4>
        <i
          className={`fas fa-chevron-down premium-toggle-icon${planosAbertos ? ' open' : ''}`}
        ></i>
      </div>

      {!planosAbertos && (
        <div className="premium-collapsed-info">
          <p>Publique mais serviços e ganhe destaque!</p>
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
                  {plano.preco > 0 && (
                    <div className="inner-plan-preco-sub">/mês</div>
                  )}
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

export default ClientPremiumPlansCard;
