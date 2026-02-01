/** ViewModel per la gestione delle nazioni. Recupera i dati dal service e gestisce il caching locale. */
import { useState, useEffect, useRef } from 'react';
import PlayerService from '../services/PlayerService';

export function useNationsViewModel() {
  const [nations, setNations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastRequestKey = useRef("");

  useEffect(() => {
    const loadNations = async () => {
      // Guardia atomica per prevenire doppie chiamate
      if (lastRequestKey.current === "nations_init") return;
      lastRequestKey.current = "nations_init";

      const cacheKey = 'cache_nations';
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        setNations(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await PlayerService.getCountries();
        setNations(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem('all_nations', JSON.stringify(data));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadNations();
  }, []);

  return { nations, loading, error };
}