import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f3f4f6',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{
        fontSize: '8rem',
        margin: '0',
        color: '#64748b'
      }}>404</h1>
      <h2 style={{
        fontSize: '2rem',
        margin: '10px 0',
        color: '#475569'
      }}>Página não encontrada</h2>
      <p style={{
        fontSize: '1.2rem',
        color: '#64748b',
        marginBottom: '30px'
      }}>A página que você está procurando não existe ou foi movida.</p>
      <Link to="/" style={{
        backgroundColor: '#1890ff',
        color: 'white',
        padding: '12px 30px',
        fontSize: '1.1rem',
        borderRadius: '8px',
        textDecoration: 'none',
        transition: 'background-color 0.2s'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#40a9ff';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#1890ff';
      }}>
        Voltar para a página inicial
      </Link>
    </div>
  );
};

export default NotFound;
