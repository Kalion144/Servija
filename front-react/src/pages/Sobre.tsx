import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';

export default function Sobre() {
  const navigate = useNavigate();
  return (
    <>
      <div className="about-container">
        <div className="about-card">
          <div className="about-header">
            <h1>Sobre Nós</h1>
            <p className="tagline">
              Conectando pessoas e serviços de forma simples e segura
            </p>
          </div>
          <div className="about-content">
            <p>
              Nosso site foi criado para conectar pessoas a prestadores de
              serviços de forma rápida, prática e segura.
            </p>
            <p>
              A plataforma facilita todo o processo de busca, permitindo que o
              usuário encontre profissionais próximos, compare serviços e entre
              em contato facilmente.
            </p>
            <div className="section-title">
              <i className="fas fa-bullseye"></i> Nosso Objetivo
            </div>
            <p>
              Nosso objetivo é tornar a contratação de serviços simples e
              acessível para todos.
            </p>
            <div className="section-title">
              <i className="fas fa-tools"></i> Profissionais que você encontra
            </div>
            <div className="services-grid">
              <div className="service-tag">⚡ Eletricistas</div>
              <div className="service-tag">🔧 Encanadores</div>
              <div className="service-tag">🧹 Diaristas</div>
              <div className="service-tag">🎨 Pintores</div>
            </div>
            <div className="section-title">
              <i className="fas fa-star"></i> Por que escolher a Servijá?
            </div>
            <ul className="feature-list">
              <li>
                <i className="fas fa-check-circle"></i> <strong>Rápido</strong>{' '}
                - Encontre profissionais em minutos
              </li>
              <li>
                <i className="fas fa-check-circle"></i> <strong>Prático</strong>{' '}
                - Tudo em um só lugar
              </li>
            </ul>
          </div>
          <div className="back-button">
            <button className="back-link" onClick={() => navigate('/')}>
              <i className="fas fa-arrow-left"></i> Voltar para a página inicial
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
