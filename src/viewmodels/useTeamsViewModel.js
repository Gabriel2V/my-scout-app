/** ViewModel per la gestione delle squadre. Fornisce l'elenco dei club appartenenti a una lega selezionata. */
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import PlayerService from '../services/PlayerService';

export function useTeamsViewModel() {
  const { serieId } = useParams();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastRequestKey = useRef("");

  useEffect(() => {
    const loadTeams = async () => {
      if (lastRequestKey.current === serieId) return;
      lastRequestKey.current = serieId;

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
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadTeams();
  }, [serieId]);

  return { teams, loading };
}