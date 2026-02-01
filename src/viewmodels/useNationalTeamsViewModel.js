/**
 * VIEWMODEL: useNationalTeamsViewModel.js
 * Gestisce il recupero parallelo delle principali squadre nazionali mondiali.
 * Implementa la logica di caching per evitare chiamate ripetute alle stesse federazioni.
 */
import { useState, useEffect } from 'react';
import PlayerService from '../services/PlayerService';

export function useNationalTeamsViewModel() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const topNations = ["Italy", "France", "Argentina", "Brazil", "Spain", "Germany", "England", "Portugal"];

  useEffect(() => {
    const fetchNationalTeams = async () => {
      const cacheKey = 'cache_national_teams';
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        setTeams(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const requests = topNations.map(name => PlayerService.searchTeams(name));
        const results = await Promise.all(requests);
        
        const nationalTeams = results
          .flat()
          .filter(item => item.team.national)
          .map(item => ({
            id: item.team.id,
            name: item.team.name,
            logo: item.team.logo
          }));

        // Logica di deduplicazione
        const uniqueTeams = Array.from(new Map(nationalTeams.map(t => [t.id, t])).values());
        
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
  }, []);

  return { teams, loading };
}