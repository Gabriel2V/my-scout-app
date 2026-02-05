/**
 * @module ViewModels/usePlayersViewModel
 * @description ViewModel per la gestione delle liste di giocatori.
 * Gestisce il caricamento paginato (Lazy Loading), la deduplicazione dei dati e il caching per contesto (squadra/lega).
 * @param {string} [externalSearchTerm=""] - Termine di ricerca opzionale per filtrare la lista.
 * @returns {Object} Esporta la lista dei giocatori, lo stato di caricamento e la funzione loadMore.
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

  // Blocca le chiamate multiple istantaneamente
  const isFetching = useRef(false);

  // Reset stato al cambio contesto
  useEffect(() => {
    setPlayers([]);
    setBatchIndex(serieId || squadraId ? 1 : 0);
    setHasMoreRemote(true);
    setLoading(true);
    isFetching.current = false; // Reset del semaforo
  }, [serieId, squadraId]);

  const loadPlayers = useCallback(async (indexToLoad) => {
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
          // Service gestisce deduplicazione chiamate
          newRawData = squadraId 
            ? await PlayerService.getPlayersByTeam(squadraId, 2024, indexToLoad)
            : await PlayerService.getPlayersByLeague(serieId, 2024, indexToLoad);
          
          if (newRawData && newRawData.length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify(newRawData));
          } else {
             console.warn(`API returned empty list for ${squadraId ? 'Team' : 'League'} ID: ${squadraId || serieId}, Page: ${indexToLoad}`);
          }
        }
        
        // Se non ci sono dati, stop paginazione
        if (!newRawData || (Array.isArray(newRawData) && newRawData.length === 0)) {
          setHasMoreRemote(false);
        }
        // L'API Free non permette pagina > 3.
        if (indexToLoad >= 3) {
          setHasMoreRemote(false);
        }
      } else {
        // Logica Global Top Players
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

      // Aggiornamento Stato
      if (isCacheDump) {
        const allCached = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('players_')) {
            const data = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(data)) allCached.push(...data);
          }
        }
        setPlayers(prev => {
          const currentIds = new Set(prev.map(p => p.id));
          const uniqueRest = allCached.map(item => new Player(item)).filter(p => !currentIds.has(p.id));
          return [...prev, ...uniqueRest];
        });
      } else if (newRawData && newRawData.length > 0) {
        const newPlayers = newRawData.map(item => new Player(item));
        setPlayers(prev => {
          // Se è la prima pagina, sostituisci. Altrimenti appendi.
          const isInitialLoad = indexToLoad === (serieId || squadraId ? 1 : 0);
          const combined = isInitialLoad ? newPlayers : [...prev, ...newPlayers];
          return Array.from(new Map(combined.map(p => [p.id, p])).values());
        });
      }
    } catch (error) {
      console.error("Errore loadPlayers:", error);
      setHasMoreRemote(false);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [serieId, squadraId]); 

  useEffect(() => {
    // Eseguiamo solo se c'è ancora roba da caricare
    if (hasMoreRemote || batchIndex === 0) {
      loadPlayers(batchIndex);
    }
  }, [batchIndex, loadPlayers, hasMoreRemote]);

  const handleLoadMore = () => {
    // Se stiamo già caricando (isFetching.current è TRUE), ignoriamo la richiesta
    if (loading || !hasMoreRemote || isFetching.current) return;
    
    isFetching.current = true; 
    setBatchIndex(prev => prev + 1);
  };

  return {
    players: players.filter(p => p.name.toLowerCase().includes(externalSearchTerm.toLowerCase())),
    loading,
    loadMore: handleLoadMore,
    hasMoreRemote
  };
}