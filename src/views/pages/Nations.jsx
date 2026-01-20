import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerService from '../../services/PlayerService';
import styles from '../../styles/Card.module.css';

export default function Nations() {
  const [nations, setNations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNations = async () => {
      // 1. CACHE: Prima controlliamo se abbiamo già i dati salvati
      const cacheKey = 'cache_nations';
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        setNations(JSON.parse(cachedData));
        setLoading(false);
        return; // Ci fermiamo qui, niente API!
      }

      // 2. API: Solo se non abbiamo la cache
      try {
        const data = await PlayerService.getCountries();
        setNations(data);
        // Salviamo per la prossima volta
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (error) {
        console.error("Errore caricamento nazioni:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadNations();
  }, []);

  if (loading) return <div className="loading">Caricamento nazioni...</div>;

  return (
    <div>
      <h2 className="pageTitle">Seleziona una Nazione</h2>
      <div className="grid">
        {nations.map(nation => (
          <div 
            key={nation.name} 
            className={styles.card} 
            onClick={() => navigate(`/nazioni/${nation.name}`)}
          >
            {nation.flag && <img src={nation.flag} alt={nation.name} />}
            <h3>{nation.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}