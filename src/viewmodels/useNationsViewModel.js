/**
 * @module ViewModels/useNationsViewModel
 * @description ViewModel per il recupero della lista delle nazioni.
 */
import { useState, useEffect } from 'react'; // Rimosso useRef non necessario
import PlayerService from '../services/PlayerService';

export function useNationsViewModel() {
  const [nations, setNations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNations = async () => {
      const cacheKey = 'cache_nations';
      const cachedData = localStorage.getItem(cacheKey);
      
if (cachedData) {
        try {
            const parsed = JSON.parse(cachedData);
            if (Array.isArray(parsed) && parsed.length > 0) {
                setNations(parsed);
                setLoading(false);
                return;
            }
        } catch (e) {
            console.warn("Cache corrotta, ricaricamento...");
            localStorage.removeItem(cacheKey);
        }
      }

      try {
        setLoading(true);
        console.log("Richiesta API Nazioni avviata...");
        
        const data = await PlayerService.getCountries();
        
        console.log("Dati ricevuti:", data);

        if (!data || data.length === 0) {
            throw new Error("L'API ha restituito una lista vuota.");
        }

        setNations(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem('all_nations', JSON.stringify(data));
      } catch (err) {
        console.error("Errore Nazioni:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadNations();
  }, []);

  return { nations, loading, error };
}