/**
 * VIEWMODEL: usePlayersViewModel.js
 * Gestisce la logica di business per le liste di giocatori (squadra, lega o globale).
 * Implementa il lazy loading, la deduplicazione dei dati e l'integrazione con la cache.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import PlayerService from '../services/PlayerService';
import { Player } from '../models/Player';

export function usePlayersViewModel(externalSearchTerm = "") {
  const { serieId, squadraId } = useParams();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchIndex, setBatchIndex] = useState(serieId || squadraId ? 1 : 0);
  const [hasMoreRemote, setHasMoreRemote] = useState(true);
  const lastRequestKey = useRef("");

  useEffect(() => {
    setPlayers([]);
    setBatchIndex(serieId || squadraId ? 1 : 0);
    setHasMoreRemote(true);
    setLoading(true);
    lastRequestKey.current = ""; 
  }, [serieId, squadraId]);

  const loadPlayers = useCallback(async (indexToLoad) => {
    const requestKey = `${squadraId || 'global'}-${serieId || 'none'}-${indexToLoad}`;
    if (lastRequestKey.current === requestKey) return;
    lastRequestKey.current = requestKey;

    setLoading(true);
    try {
      let newRawData = [];
      let isCacheDump = false;

      if (squadraId || serieId) {
        const contextKey = squadraId ? `team_${squadraId}` : `league_${serieId}`;
        const cacheKey = `players_${contextKey}_p${indexToLoad}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          newRawData = JSON.parse(cachedData);
        } else {
          newRawData = squadraId 
            ? await PlayerService.getPlayersByTeam(squadraId, 2024, indexToLoad)
            : await PlayerService.getPlayersByLeague(serieId, 2024, indexToLoad);
          
          if (newRawData && newRawData.length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify(newRawData));
          }
        }
        if (!newRawData || (Array.isArray(newRawData) && newRawData.length < 20)) {
          setHasMoreRemote(false);
        }
      } else {
        if (indexToLoad < 5) {
          const leagueId = PlayerService.topLeagues[indexToLoad]?.id;
          const cacheKey = `players_global_top_${leagueId}`;
          const cachedData = localStorage.getItem(cacheKey);
          if (cachedData) {
            newRawData = JSON.parse(cachedData);
          } else {
            newRawData = await PlayerService.getTopPlayersBatch(indexToLoad);
            if (newRawData && newRawData.length > 0) localStorage.setItem(cacheKey, JSON.stringify(newRawData));
          }
        } else {
          isCacheDump = true;
          setHasMoreRemote(false);
        }
      }

      if (isCacheDump) {
        const allCached = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('players_')) {
            const data = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(data)) allCached.push(...data);
          }
        }
        const currentIds = new Set(players.map(p => p.id));
        const uniqueRest = allCached.map(item => new Player(item)).filter(p => !currentIds.has(p.id));
        setPlayers(prev => [...prev, ...uniqueRest]);
      } else if (newRawData && newRawData.length > 0) {
        const newPlayers = newRawData.map(item => new Player(item));
        setPlayers(prev => {
          const combined = indexToLoad === (serieId || squadraId ? 1 : 0) ? newPlayers : [...prev, ...newPlayers];
          return Array.from(new Map(combined.map(p => [p.id, p])).values());
        });
      }
    } catch (error) {
      console.error(error);
      setHasMoreRemote(false);
    } finally {
      setLoading(false);
    }
  }, [serieId, squadraId, players.length]);

  useEffect(() => {
    if (hasMoreRemote || batchIndex === 0) {
      loadPlayers(batchIndex);
    }
  }, [batchIndex, loadPlayers]);

  return {
    players: players.filter(p => p.name.toLowerCase().includes(externalSearchTerm.toLowerCase())),
    loading,
    loadMore: () => !loading && hasMoreRemote && setBatchIndex(prev => prev + 1),
    hasMoreRemote
  };
}