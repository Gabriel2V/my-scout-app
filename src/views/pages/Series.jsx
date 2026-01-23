/**
 * PAGE: Series.jsx
 * Mostra i campionati (leghe) disponibili per una specifica nazione selezionata
 * Permette la navigazione verso le squadre o i giocatori di quel campionato
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PlayerService from '../../services/PlayerService';
import styles from '../../styles/Card.module.css';

export default function Series() {
  const { nazioneId } = useParams();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadLeagues = async () => {
      const cacheKey = `cache_series_${nazioneId}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        setLeagues(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await PlayerService.getLeagues(nazioneId);
        setLeagues(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (error) {
        console.error("Errore caricamento campionati:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLeagues();
  }, [nazioneId]);

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
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/nazioni/${nazioneId}/serie/${item.league.id}/squadre`);
                }}
              >
                🛡️ Squadre
              </button>
              <button 
                className={`${styles.btnAction} ${styles.btnAccent}`}
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/nazioni/${nazioneId}/serie/${item.league.id}/giocatori`);
                }}
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