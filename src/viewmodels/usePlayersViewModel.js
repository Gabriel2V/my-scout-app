/**
 * VIEWMODEL: usePlayersViewModel.js
 * Custom Hook che gestisce lo stato e la logica per le liste di giocatori
 * Coordina il recupero dati (per lega, squadra o globale), la paginazione e il filtraggio locale
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import PlayerService from '../services/PlayerService';
import { Player } from '../models/Player';

export function usePlayersViewModel(externalSearchTerm = "") {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  // batchIndex funge da contatore: 
  // Per le Leghe (serieId): è il numero di pagina API (1, 2, 3...)
  // Per la Global View: è l'indice della lega da caricare (0=Premier, 1=Serie A... fino a 4)
  // Quando supera 4 in Global View, attiva il caricamento dalla cache
  const [batchIndex, setBatchIndex] = useState(0); 
  const [hasMoreRemote, setHasMoreRemote] = useState(true);

  const { serieId, squadraId } = useParams();

  // Reset stato quando cambia la rotta
  useEffect(() => {
    setPlayers([]);
    setBatchIndex(serieId || squadraId ? 1 : 0); 
    setHasMoreRemote(true);
    setLoading(true);
  }, [serieId, squadraId]);

  // Funzione helper per estrarre e ordinare tutti i giocatori dalla cache
  const loadRestFromCache = useCallback((currentPlayers) => {
    console.log("📥 Caricamento residuo dalla cache locale...");
    let allCached = [];
    
    // Scansiona tutto il localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Cerca chiavi che contengono array di giocatori (es. "players_team_...", "players_league_...")
      if (key && key.startsWith('players_')) {
        try {
          const rawData = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(rawData)) {
            allCached = [...allCached, ...rawData];
          }
        } catch (e) { console.warn(`Skip key ${key}`, e); }
      }
    }

    // Filtra quelli già visualizzati
    const currentIds = new Set(currentPlayers.map(p => p.id));
    const uniqueRest = [];
    const processedIds = new Set(); // Per evitare duplicati interni alla cache

    allCached.forEach(item => {
      const pId = item.player?.id || item.id;
      if (pId && !currentIds.has(pId) && !processedIds.has(pId)) {
        processedIds.add(pId);
        uniqueRest.push(new Player(item));
      }
    });

    // Ordina per Rating decrescente
    uniqueRest.sort((a, b) => {
      const rateA = parseFloat(a.rating) || 0;
      const rateB = parseFloat(b.rating) || 0;
      return rateB - rateA;
    });

    return uniqueRest;
  }, []);

  useEffect(() => {
    const loadPlayers = async () => {
      setLoading(true);
      try {
        let newRawData = [];
        let shouldAppend = true;
        let isCacheDump = false;

        // VISUALIZZAZIONE SQUADRA (Carica tutto subito) 
        if (squadraId) {
          const cacheKey = `players_team_${squadraId}`;
          const cachedData = localStorage.getItem(cacheKey);
          
          if (cachedData) {
            newRawData = JSON.parse(cachedData);
          } else {
            newRawData = await PlayerService.getPlayersByTeam(squadraId);
            if (newRawData.length > 0) localStorage.setItem(cacheKey, JSON.stringify(newRawData));
          }
          setHasMoreRemote(false);
          shouldAppend = false; 
        }
        
        // VISUALIZZAZIONE LEGA (Paginazione standard) 
        else if (serieId) {
          const cacheKey = `players_league_${serieId}_page_${batchIndex}`;
          const cachedData = localStorage.getItem(cacheKey);

          if (cachedData) {
            newRawData = JSON.parse(cachedData);
          } else {
            newRawData = await PlayerService.getPlayersByLeague(serieId, 2024, batchIndex);
            if (newRawData && newRawData.length > 0) {
              localStorage.setItem(cacheKey, JSON.stringify(newRawData));
            }
          }

          if (!newRawData || newRawData.length < 20) setHasMoreRemote(false);
        }

        // GLOBAL VIEW (Strategia 5 Leghe + Cache)
        else {
          // Carica le 5 leghe top una alla volta
          if (batchIndex < 5) {
            const leagueId = PlayerService.topLeagues[batchIndex]?.id; // Recupera ID per cache key stabile
            const cacheKey = `players_global_top_league_${leagueId}`; // Cache key specifica per lega
            const cachedData = localStorage.getItem(cacheKey);

            if (cachedData) {
              console.log(`Using cached Top Players (Index ${batchIndex})`);
              newRawData = JSON.parse(cachedData);
            } else {
              console.log(`Fetching Top Players Batch ${batchIndex + 1}/5...`);
              newRawData = await PlayerService.getTopPlayersBatch(batchIndex);
              if (newRawData.length > 0) {
                localStorage.setItem(cacheKey, JSON.stringify(newRawData));
              }
            }
          } 
          // Leghe finite, carica tutto il resto dalla cache
          else {
            isCacheDump = true;
            setHasMoreRemote(false); // Stop loading after this
          }
        }

        if (isCacheDump) {
          setPlayers(prev => {
            const cachedRest = loadRestFromCache(prev);
            return [...prev, ...cachedRest];
          });
        } else if (newRawData && newRawData.length > 0) {
          const newPlayers = newRawData.map(item => new Player(item));
          setPlayers(prev => {
             // rimuovere eventuali duplicati che arrivano dall'API
             const combined = shouldAppend ? [...prev, ...newPlayers] : newPlayers;
             const unique = Array.from(new Map(combined.map(p => [p.id, p])).values());
             return unique;
          });
        } else if (!squadraId && !serieId && batchIndex < 5) {

        }

      } catch (error) {
        console.error("Errore caricamento:", error);
        setHasMoreRemote(false);
      } finally {
        setLoading(false);
      }
    };


    if (hasMoreRemote) {
        loadPlayers();
    }

  }, [serieId, squadraId, batchIndex, hasMoreRemote, loadRestFromCache]);

  const loadMore = useCallback(() => {
    if (!loading && hasMoreRemote) {
      setBatchIndex(prev => prev + 1);
    }
  }, [loading, hasMoreRemote]);

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(externalSearchTerm.toLowerCase())
  );

  return {
    players: filteredPlayers,
    searchTerm,
    setSearchTerm,
    loading,
    loadMore,
    hasMoreRemote
  };
}