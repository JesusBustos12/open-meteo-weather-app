"use client";

export default function GlobalError({ error, reset }) {
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
      <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</span>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 700 }}>
        Algo salió mal
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '2rem', maxWidth: '400px' }}>
        Ha ocurrido un error inesperado. Puedes intentar recargar la página.
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: '0.8rem 2rem',
          background: '#1dd0ed',
          color: '#020617',
          border: 'none',
          borderRadius: '0.4rem',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
