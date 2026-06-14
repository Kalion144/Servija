import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = 'http://localhost:3000';

interface Metrics {
  totalGanho: number;
  clientesAtendidos: number;
  conversasAtivas: number;
  totalPropostas: number;
  propostsAceitas: number;
  taxaAceitacao: number;
  plan: string;
  avaliacoes: {
    media: number;
    mediaTrabalho: number;
    mediaTempoExecucao: number;
    mediaTempoResposta: number;
    total: number;
  };
  ganhosMessais: { mes: string; total: number }[];
  ultimasAvaliacoes: { estrelas: number; comentario: string | null; created_at: number }[];
}

const planLabel: Record<string, string> = { FREE: 'Free', PRO: 'Pro', PREMIUM: 'Premium' };
const planColor: Record<string, string> = {
  FREE: '#6b7280',
  PRO: '#f97316',
  PREMIUM: '#7c3aed',
};

function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: '14px', letterSpacing: '1px' }}>
      {Array.from({ length: max }, (_, i) => (
        <i key={i} className={i < Math.round(value) ? 'fas fa-star' : 'far fa-star'} />
      ))}
    </span>
  );
}

function MetricCard({
  icon, label, value, sub, color, iconBg,
}: {
  icon: string; label: string; value: string; sub?: string; color: string; iconBg: string;
}) {
  return (
    <div style={{
      background: 'white', borderRadius: '20px', padding: '22px',
      boxShadow: '0 2px 14px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
      display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: '10px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', color }}>
          <i className={icon} />
        </div>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#9ca3af' }}>{sub}</div>}
    </div>
  );
}

function BarChart({ data }: { data: { mes: string; total: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const months: Record<string, string> = {
    '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
    '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
    '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
  };

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
        <i className="fas fa-chart-bar" style={{ fontSize: '2rem', marginBottom: '8px', display: 'block' }} />
        Nenhum ganho registrado ainda
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '140px', padding: '0 4px' }}>
      {data.map((d) => {
        const [, mm] = d.mes.split('-');
        const pct = (d.total / maxVal) * 100;
        return (
          <div key={d.mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600 }}>
              R${d.total >= 1000 ? `${(d.total / 1000).toFixed(1)}k` : d.total}
            </span>
            <div
              title={`R$ ${d.total.toFixed(2)}`}
              style={{
                width: '100%', background: 'linear-gradient(180deg, #f97316, #ea580c)',
                borderRadius: '6px 6px 0 0', height: `${Math.max(pct, 4)}%`,
                transition: 'height 0.5s ease', cursor: 'default',
              }}
            />
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>{months[mm] ?? mm}</span>
          </div>
        );
      })}
    </div>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
      <span style={{ fontSize: '12px', color: '#6b7280', width: '120px', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '99px',
          background: 'linear-gradient(90deg, #f59e0b, #d97706)',
          width: `${(value / 5) * 100}%`, transition: 'width 0.6s ease',
        }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', width: '28px', textAlign: 'right' }}>
        {value > 0 ? value.toFixed(1) : '-'}
      </span>
    </div>
  );
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/professionals/metrics`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.erro) setError(data.erro);
        else setMetrics(data);
      })
      .catch(() => setError('Erro ao carregar métricas'))
      .finally(() => setLoading(false));
  }, []);

  const name = usuario?.nome?.split(' ')[0] ?? 'Profissional';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .dash-wrap { min-height:100vh; background:#f8fafc; font-family:'Inter',sans-serif; color:#0f172a; }
        .dash-header { background:white; padding:18px 32px; display:flex; align-items:center; gap:14px; box-shadow:0 1px 0 #e2e8f0; position:sticky; top:0; z-index:50; }
        .dash-back { width:38px; height:38px; border:none; border-radius:10px; background:#f1f5f9; color:#475569; cursor:pointer; font-size:15px; display:flex; align-items:center; justify-content:center; transition:.2s; }
        .dash-back:hover { background:#e2e8f0; }
        .dash-title { font-size:20px; font-weight:800; flex:1; }
        .dash-plan-pill { padding:5px 14px; border-radius:20px; font-size:12px; font-weight:700; }
        .dash-body { max-width:1100px; margin:0 auto; padding:28px 24px 60px; }
        .dash-grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
        .dash-grid-2 { display:grid; grid-template-columns:2fr 1fr; gap:16px; margin-bottom:24px; }
        .dash-card { background:white; border-radius:20px; padding:24px; box-shadow:0 2px 14px rgba(0,0,0,0.05); border:1px solid #f1f5f9; }
        .dash-card-title { font-size:14px; font-weight:700; color:#374151; margin-bottom:18px; display:flex; align-items:center; gap:8px; }
        .review-item { padding:12px 0; border-bottom:1px solid #f1f5f9; }
        .review-item:last-child { border-bottom:none; }
        .review-comment { font-size:13px; color:#4b5563; margin-top:5px; line-height:1.4; font-style:italic; }
        .review-date { font-size:11px; color:#9ca3af; margin-top:3px; }
        .donut-wrap { display:flex; align-items:center; justify-content:center; gap:24px; }
        .donut { width:100px; height:100px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:800; color:#0f172a; }
        @media(max-width:900px) { .dash-grid-4{grid-template-columns:repeat(2,1fr)} .dash-grid-2{grid-template-columns:1fr} }
        @media(max-width:500px) { .dash-grid-4{grid-template-columns:1fr} .dash-header{padding:14px 16px} .dash-body{padding:16px 12px 48px} }
      `}</style>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div className="dash-wrap">
        <div className="dash-header">
          <button className="dash-back" onClick={() => navigate('/professional/home')}>
            <i className="fas fa-arrow-left" />
          </button>
          <div className="dash-title">📊 Relatórios de {name}</div>
          {metrics && (
            <div
              className="dash-plan-pill"
              style={{ background: `${planColor[metrics.plan]}18`, color: planColor[metrics.plan] }}
            >
              {planLabel[metrics.plan]}
            </div>
          )}
        </div>

        <div className="dash-body">
          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '12px', display: 'block' }} />
              Carregando métricas...
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#ef4444' }}>
              <i className="fas fa-exclamation-circle" style={{ fontSize: '2rem', marginBottom: '12px', display: 'block' }} />
              {error}
            </div>
          )}

          {metrics && (
            <>
              {/* KPI cards */}
              <div className="dash-grid-4">
                <MetricCard
                  icon="fas fa-wallet"
                  label="Total Ganho"
                  value={`R$ ${metrics.totalGanho.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  sub="em serviços concluídos"
                  color="#16a34a"
                  iconBg="#f0fdf4"
                />
                <MetricCard
                  icon="fas fa-users"
                  label="Clientes Atendidos"
                  value={String(metrics.clientesAtendidos)}
                  sub="clientes únicos"
                  color="#2563eb"
                  iconBg="#eff6ff"
                />
                <MetricCard
                  icon="fas fa-paper-plane"
                  label="Propostas Enviadas"
                  value={String(metrics.totalPropostas)}
                  sub={`${metrics.propostsAceitas} aceitas`}
                  color="#f97316"
                  iconBg="#fff7ed"
                />
                <MetricCard
                  icon="fas fa-comments"
                  label="Conversas Ativas"
                  value={String(metrics.conversasAtivas)}
                  sub="em andamento agora"
                  color="#7c3aed"
                  iconBg="#f5f3ff"
                />
              </div>

              {/* Chart + Taxa */}
              <div className="dash-grid-2">
                <div className="dash-card">
                  <div className="dash-card-title">
                    <i className="fas fa-chart-bar" style={{ color: '#f97316' }} />
                    Ganhos Mensais (últimos 6 meses)
                  </div>
                  <BarChart data={metrics.ganhosMessais} />
                </div>

                <div className="dash-card">
                  <div className="dash-card-title">
                    <i className="fas fa-bullseye" style={{ color: '#7c3aed' }} />
                    Taxa de Aceitação
                  </div>
                  <div className="donut-wrap" style={{ flexDirection: 'column', gap: '12px' }}>
                    <div
                      className="donut"
                      style={{
                        background: `conic-gradient(#7c3aed ${metrics.taxaAceitacao * 3.6}deg, #f1f5f9 0deg)`,
                        boxShadow: '0 0 0 10px white inset',
                      }}
                    >
                      <span style={{ background: 'white', borderRadius: '50%', width: 76, height: 76, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800 }}>
                        {metrics.taxaAceitacao}%
                      </span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {metrics.propostsAceitas} de {metrics.totalPropostas} propostas aceitas
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ratings + Reviews */}
              <div className="dash-grid-2">
                <div className="dash-card">
                  <div className="dash-card-title">
                    <i className="fas fa-star" style={{ color: '#f59e0b' }} />
                    Desempenho & Avaliações
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', padding: '16px', background: '#fffbeb', borderRadius: '14px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '42px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                        {metrics.avaliacoes.media > 0 ? metrics.avaliacoes.media.toFixed(1) : '-'}
                      </div>
                      <Stars value={metrics.avaliacoes.media} />
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                        {metrics.avaliacoes.total} avaliações
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <RatingBar label="Qualidade do trabalho" value={metrics.avaliacoes.mediaTrabalho} />
                      <RatingBar label="Tempo de execução" value={metrics.avaliacoes.mediaTempoExecucao} />
                      <RatingBar label="Tempo de resposta" value={metrics.avaliacoes.mediaTempoResposta} />
                    </div>
                  </div>

                  {/* Últimas avaliações */}
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '12px' }}>
                    Avaliações recentes
                  </div>
                  {metrics.ultimasAvaliacoes.length === 0 ? (
                    <div style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                      Nenhuma avaliação ainda
                    </div>
                  ) : (
                    metrics.ultimasAvaliacoes.map((av, i) => (
                      <div key={i} className="review-item">
                        <Stars value={av.estrelas} />
                        {av.comentario && <div className="review-comment">"{av.comentario}"</div>}
                        <div className="review-date">
                          {new Date(av.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="dash-card">
                  <div className="dash-card-title">
                    <i className="fas fa-chart-pie" style={{ color: '#2563eb' }} />
                    Resumo de Propostas
                  </div>
                  {[
                    { label: 'Aceitas', value: metrics.propostsAceitas, color: '#16a34a', icon: 'fa-check-circle' },
                    { label: 'Pendentes', value: metrics.totalPropostas - metrics.propostsAceitas, color: '#f59e0b', icon: 'fa-clock' },
                    { label: 'Total enviadas', value: metrics.totalPropostas, color: '#3b82f6', icon: 'fa-paper-plane' },
                    { label: 'Clientes únicos', value: metrics.clientesAtendidos, color: '#7c3aed', icon: 'fa-users' },
                  ].map((item) => (
                    <div key={item.label} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 0', borderBottom: '1px solid #f1f5f9',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className={`fas ${item.icon}`} style={{ color: item.color, fontSize: '14px', width: '16px' }} />
                        <span style={{ fontSize: '13px', color: '#374151' }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{item.value}</span>
                    </div>
                  ))}

                  <div style={{ marginTop: '20px', padding: '14px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>PLANO ATUAL</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: planColor[metrics.plan] }}>
                      {planLabel[metrics.plan]}
                    </div>
                    {metrics.plan !== 'PREMIUM' && (
                      <button
                        onClick={() => navigate('/professional/home')}
                        style={{
                          marginTop: '10px', fontSize: '11px', fontWeight: 700, background: 'none',
                          border: `1px solid ${planColor[metrics.plan]}`, color: planColor[metrics.plan],
                          padding: '5px 14px', borderRadius: '20px', cursor: 'pointer',
                        }}
                      >
                        Fazer upgrade
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
