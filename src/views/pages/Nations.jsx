/**
 * PAGE: Nations.jsx
 * Visualizza l'elenco delle nazioni disponibili
 * Utilizza la cache per evitare chiamate API ripetute per dati statici
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerService from '../../services/PlayerService';
import GenericCard from '../components/GenericCard';

export default function Nations() {
  const [nations, setNations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNations = async () => {
      const cacheKey = 'cache_nations';
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        setNations(JSON.parse(cachedData));
        setLoading(false);
        return;
      }
      try {
        const data = await PlayerService.getCountries();
        setNations(data);
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
          <GenericCard 
            key={nation.name}
            title={nation.name}
            image={nation.flag}
            onClick={() => navigate(`/nazioni/${nation.name}`)}
          />
        ))}
      </div>
    </div>
  );
}