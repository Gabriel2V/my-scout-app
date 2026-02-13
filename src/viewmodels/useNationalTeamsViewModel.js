/**
 * @module ViewModels/useNationalTeamsViewModel
 * @description ViewModel React Hook per il caricamento delle principali squadre nazionali.
 * 
 * Recupera le federazioni nazionali delle 8 nazioni più importanti tramite
 * ricerca parallela e deduplicazione risultati.
 * 
 * Pattern implementati:
 * - Parallel Fetching: `Promise.all` per ottimizzare i tempi
 * - Cache-First Loading
 * - Deduplication: rimozione squadre duplicate per ID
 */

import { useState, useEffect } from 'react';
import PlayerService from '../services/PlayerService';

/**
 * Hook per il recupero delle squadre nazionali.
 * 
 * Flusso:
 * 1. Verifica cache localStorage (`cache_national_teams`)
 * 2. Se assente, esegue 8 ricerche parallele (una per nazione)
 * 3. Filtra solo squadre con `team.national === true`
 * 4. Deduplica per ID e persiste risultato
 * 
 * Nazioni caricate:
 * Italy, France, Argentina, Brazil, Spain, Germany, England, Portugal
 * 
 * @function useNationalTeamsViewModel
 * @returns {Object} Stato delle nazionali
 * @returns {Array<Object>} return.teams - Squadre nazionali
 * @returns {number} return.teams[].id - ID univoco nazionale
 * @returns {string} return.teams[].name - Nome nazionale (es. "Italy")
 * @returns {string} return.teams[].logo - URL logo
 * @returns {boolean} return.loading - Flag di caricamento
 * 
 * @example
 * const { teams, loading } = useNationalTeamsViewModel();
 * // teams: [
 * //   { id: 768, name: "Italy", logo: "..." },
 * //   { id: 1569, name: "Argentina", logo: "..." },
 * //   ...
 * // ]
 */
export function useNationalTeamsViewModel() {
  /**
   * Array delle squadre nazionali caricate.
   * @type {Array}
   */
  const [teams, setTeams] = useState([]);

  /**
   * Flag di caricamento.
  * @type {Array}
   */
  const [loading, setLoading] = useState(true);

  /**
   * Lista delle nazioni top da caricare.
   * Constant array definita al mount.
   * @type {string[]}
   */
  const topNations = ["Italy", "France", "Argentina", "Brazil", "Spain", "Germany", "England", "Portugal"];

  useEffect(() => {
    /**
     * Carica le nazionali con strategia parallela e deduplicazione.
     * 
     * **Strategia di caricamento:**
     * 1. Cache check
     * 2. Parallel search per ogni nazione via `Promise.all`
     * 3. Flatten risultati
     * 4. Filter solo `team.national === true`
     * 5. Deduplicazione tramite Map
     * 6. Persistenza se risultati > 0
     * 
     * @async
     * @private
     */
    const fetchNationalTeams = async () => {
      const cacheKey = 'cache_national_teams';
      const cachedData = localStorage.getItem(cacheKey);

      // Caricamento da cache
      if (cachedData) {
        setTeams(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Ricerca parallela per tutte le nazioni
        const requests = topNations.map(name => PlayerService.searchTeams(name));
        const results = await Promise.all(requests);
        
        // Elaborazione risultati
        const nationalTeams = results
          .flat() // Appiattisce array di array
          .filter(item => item.team.national) // Solo nazionali
          .map(item => ({
            id: item.team.id,
            name: item.team.name,
            logo: item.team.logo
          }));

        // Deduplicazione per ID (alcune nazioni potrebbero apparire più volte)
        const uniqueTeams = Array.from(new Map(nationalTeams.map(t => [t.id, t])).values());
        
        // Persistenza solo se ci sono risultati
        if (uniqueTeams.length > 0) {
          localStorage.setItem(cacheKey, JSON.stringify(uniqueTeams));
        }
        
        setTeams(uniqueTeams);
      } catch (error) {
        console.error("Errore caricamento nazionali:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNationalTeams();
  }, []); // Esegue solo al mount

  return { teams, loading };
}