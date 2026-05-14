import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#020617',
      color: '#f1f5f9',
      fontFamily: 'Inter, system-ui, sans-serif',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <span style={{ fontSize: '5rem', marginBottom: '1rem' }}>🌍</span>
      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', fontWeight: 700 }}>
        404
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '2rem' }}>
        Esta página no existe o fue movida.
      </p>
      <Link
        href="/"
        style={{
          padding: '0.8rem 2rem',
          background: '#1dd0ed',
          color: '#020617',
          borderRadius: '0.4rem',
          fontSize: '1rem',
          fontWeight: 600,
          textDecoration: 'none'
        }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
