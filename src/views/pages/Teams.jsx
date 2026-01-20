import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PlayerService from '../../services/PlayerService';
import styles from '../../styles/Card.module.css';

export default function Teams() {
  const { serieId } = useParams();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTeams = async () => {
      const cacheKey = `cache_teams_${serieId}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        setTeams(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await PlayerService.getTeams(serieId);
        setTeams(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (error) {
        console.error("Errore caricamento squadre:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTeams();
  }, [serieId]);

  if (loading) return <div className="loading">Caricamento squadre...</div>;

  return (
    <div>
      <h2 className="pageTitle">Squadre del Campionato</h2>
      {teams.length === 0 && !loading && <p style={{textAlign:'center'}}>Nessuna squadra trovata.</p>}

      <div className="grid">
        {teams.map(item => (
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