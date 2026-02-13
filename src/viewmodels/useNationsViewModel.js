/**
 * @module ViewModels/useNationsViewModel
 * @description ViewModel per il recupero della lista delle nazioni supportate.
 * Gestisce la cache persistente per evitare chiamate ripetute a dati che cambiano raramente.
 * Strategia di Cache:
 * - Salva la lista completa in `localStorage` ('cache_nations').
 * - Al caricamento, controlla prima la cache. Se valida, evita la chiamata API.
 * - In caso di cache corrotta o vuota, forza il refresh dall'API.
 */
import { useState, useEffect } from 'react'; 
import PlayerService from '../services/PlayerService';

/**
 * Hook per il recupero delle nazioni.
 * @function useNationsViewModel
 * @returns {Object} Stato delle nazioni.
 * @returns {Array<{name: string, flag: string}>} return.nations - Lista di nazioni con nome e bandiera.
 * @returns {boolean} return.loading - Flag di caricamento.
 * @returns {string|null} return.error - Eventuale messaggio di errore.
 */
export function useNationsViewModel() {
  const [nations, setNations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNations = async () => {
      const cacheKey = 'cache_nations';
      const cachedData = localStorage.getItem(cacheKey);
      
      // Controllo validità Cache
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

      //  Fetch API se cache assente/invalida
      try {
        setLoading(true);
        const data = await PlayerService.getCountries();

        if (!data || data.length === 0) {
            throw new Error("L'API ha restituito una lista vuota.");
        }

        setNations(data);
        // Salva sia come cache specifica che come fallback globale
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