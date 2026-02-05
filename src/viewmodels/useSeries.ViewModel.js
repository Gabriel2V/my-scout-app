/** 
 * @module ViewModels/useSeriesViewModel 
 * @description Gestisce i campionati filtrati per nazioneId. 
*/
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import PlayerService from '../services/PlayerService';

export function useSeriesViewModel() {
  const { nazioneId } = useParams();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastRequestKey = useRef("");

  useEffect(() => {
    const loadLeagues = async () => {
      if (lastRequestKey.current === nazioneId) return;
      lastRequestKey.current = nazioneId;

      const cacheKey = `cache_series_${nazioneId}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        setLeagues(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await PlayerService.getLeagues(nazioneId);
        setLeagues(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadLeagues();
  }, [nazioneId]);

  return { leagues, loading, nazioneId };
}