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
  const [error, setError] = useState(null); 
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
        setLoading(true);
        setError(null);
        const data = await PlayerService.getCountries();
        
        if (!data || data.length === 0) {
          throw new Error("L'API ha restituito una lista vuota. Verifica la tua chiave API.");
        }

        setNations(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (err) {
        console.error("Errore caricamento nazioni:", err);
        setError(err.message); 
      } finally {
        setLoading(false);
      }
    };
    loadNations();
  }, []);

  if (loading) return <div className="loading">Caricamento nazioni...</div>;

  // Se c'è un errore
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 className="pageTitle">Errore di Caricamento</h2>
        <p style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
          {error}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer' }}
          >
            Riprova
          </button>
          <button 
            onClick={() => navigate('/api-debug')}
            style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer' }}
          >
            Controlla API Key
          </button>
        </div>
      </div>
    );
  }

return (
    <div>
      <h2 className="pageTitle">Seleziona una Nazione</h2>
      {nations.length > 0 && <p>Caricate {nations.length} nazioni</p>}
      
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