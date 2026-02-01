/**
 * PAGE: Series.jsx
 * Mostra i campionati (leghe) disponibili per una specifica nazione selezionata
 * Permette la navigazione verso le squadre o i giocatori di quel campionato
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeriesViewModel } from '../../viewmodels/useSeries.ViewModel';
import styles from '../../styles/Card.module.css';

export default function Series() {
  const { leagues, loading, nazioneId } = useSeriesViewModel();
  const navigate = useNavigate();

  if (loading) return <div className="loading">Analisi campionati in corso...</div>;

  return (
    <div>
      <h2 className="pageTitle">Campionati in {nazioneId}</h2>
      <div className="grid">
        {leagues.map(item => (
          <div key={item.league.id} className={styles.card}>
            <img src={item.league.logo} alt={item.league.name} />
            <h3>{item.league.name}</h3>
            <div className={styles.extra}>
              <button 
                className={`${styles.btnAction} ${styles.btnPrimary}`}
                onClick={() => navigate(`/nazioni/${nazioneId}/serie/${item.league.id}/squadre`)}
              >
                🛡️ Squadre
              </button>
              <button 
                className={`${styles.btnAction} ${styles.btnAccent}`}
                onClick={() => navigate(`/nazioni/${nazioneId}/serie/${item.league.id}/giocatori`)}
              >
                ⚽ Giocatori
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}