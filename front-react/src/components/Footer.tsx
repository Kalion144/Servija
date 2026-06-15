export function Footer() {
  return (
    <div
      className="footer"
      style={{
        background: '#1e293b',
        color: '#94a3b8',
        marginTop: '2rem',
        padding: '2rem 1.5rem 1rem',
        borderRadius: '1.5rem',
      }}
    >
      <div
        className="footer-content"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))',
          gap: '1.5rem',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div className="footer-col">
          <h4 style={{ color: 'white' }}>Servijá</h4>
          <p>Conectando pessoas e serviços</p>
        </div>
        <div className="footer-col">
          <h4 style={{ color: 'white' }}>Links</h4>
          <a href="/sobre.html">Sobre</a>
          <a href="/">Termos</a>
        </div>
        <div className="footer-col">
          <h4 style={{ color: 'white' }}>Redes</h4>
          <div
            className="social-links"
            style={{ display: 'flex', gap: '1rem' }}
          >
            <a href="#">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#">
              <i className="fab fa-facebook"></i>
            </a>
          </div>
        </div>
      </div>
      <div
        className="footer-bottom"
        style={{
          textAlign: 'center',
          paddingTop: '1.5rem',
          borderTop: '1px solid #334155',
          fontSize: '0.7rem',
        }}
      >
        © 2025 Servijá - Todos os direitos reservados
      </div>
    </div>
  );
}
