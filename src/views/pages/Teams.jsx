/**
 * @component Teams
 * @description Visualizza i club appartenenti a un campionato selezionato.
 * Si interfaccia con useTeamsViewModel per i dati.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamsViewModel } from '../../viewmodels/useTeamsViewModel';
import styles from '../../styles/Card.module.css';

export default function Teams() {
  const { teams, loading } = useTeamsViewModel();
  const navigate = useNavigate();

  if (loading) return <div className="loading">Caricamento squadre...</div>;

  return (
    <div>
      <h2 className="pageTitle">Squadre del Campionato</h2>
  
      {(!teams || teams.length === 0) && !loading && (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary-light)' }}>
          Nessuna squadra trovata.
        </p>
      )}

      <div className="grid">
        {(teams || []).map(item => (
          <div 
            key={item.team.id} 
            className={styles.card}
            onClick={() => navigate(`/squadre/${item.team.id}/giocatori`)}
          >
            <img src={item.team.logo} alt={item.team.name} />
            <h3>{item.team.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}