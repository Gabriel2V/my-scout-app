/**
 * @component NotFound
 * @description Pagina di fallback (404).
 * Gestisce i tentativi di accesso a rotte non definite, fornendo un link di ritorno alla Home.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/HomePage.module.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className={styles.hero} style={{ padding: '5rem 1rem' }}>
      <span style={{ fontSize: '5rem' }}>🏟️</span>
      <h1 style={{ marginTop: '1rem' }}>404 - Fuorigioco!</h1>
      <p>La pagina che stai cercando non esiste o è stata spostata.</p>
      <button 
        onClick={() => navigate('/')}
        style={{
          padding: '1rem 2rem',
          backgroundColor: 'var(--accent)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontWeight: '700',
          cursor: 'pointer',
          fontSize: '1rem',
          marginTop: '2rem'
        }}
      >
        Torna alla Dashboard
      </button>
    </div>
  );
}