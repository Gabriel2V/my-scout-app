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

  if (loading) return <div className="loading">Caricamento campionati...</div>;

  return (
    <div>
      <h2 className="pageTitle">Campionati in {nazioneId}</h2>
      {leagues.length === 0 && !loading && <p style={{textAlign:'center'}}>Nessun campionato trovato.</p>}
      
      <div className="grid">
        {leagues.map(item => (
          <div key={item.league.id} className={styles.card}>
            <img src={item.league.logo} alt={item.league.name} />
            <h3>{item.league.name}</h3>
            <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'auto'}}>
              <button 
                className={styles.btn}
                style={{fontSize: '0.7rem', padding: '0.4rem'}}
                onClick={() => navigate(`/nazioni/${nazioneId}/serie/${item.league.id}/squadre`)}
              >
                Squadre
              </button>
              <button 
                className={styles.btn}
                style={{fontSize: '0.7rem', padding: '0.4rem', backgroundColor: '#444'}}
                onClick={() => navigate(`/nazioni/${nazioneId}/serie/${item.league.id}/giocatori`)}
              >
                Giocatori
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}