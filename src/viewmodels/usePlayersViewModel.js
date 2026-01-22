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
  const [batchIndex, setBatchIndex] = useState(1); 
  const [hasMoreRemote, setHasMoreRemote] = useState(true);

  const { serieId, squadraId } = useParams();
// Reset stato quando cambia la rotta
  useEffect(() => {
    setPlayers([]);
    setBatchIndex(1); // Reset a pagina 1
    setHasMoreRemote(true);
    setLoading(true);
  }, [serieId, squadraId]);

  // Caricamento Dati
  useEffect(() => {
    const loadPlayers = async () => {
      if (batchIndex === 1) setLoading(true);

      // Una chiave cache che include la pagina per evitare conflitti
      const cacheKey = squadraId 
        ? `players_team_${squadraId}` 
        : serieId 
          ? `players_league_${serieId}_page_${batchIndex}` 
          : `players_global_batch_${batchIndex}`;

      // Controllo Cache (base)
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const rawData = JSON.parse(cachedData);
        const cachedPlayers = rawData.map(item => new Player(item));
        
        // Se è una squadra, sostituisci tutto
        if (squadraId) {
            setPlayers(cachedPlayers);
            setHasMoreRemote(false);
        } else {
            // Se è lega o globale, appendi
            setPlayers(prev => batchIndex === 1 ? cachedPlayers : [...prev, ...cachedPlayers]);
        }
        
        setLoading(false);
        return;
      }

      try {
        let newRawData = [];

        if (squadraId) { 
          if (batchIndex === 1) { 
            newRawData = await PlayerService.getPlayersByTeam(squadraId);
            setHasMoreRemote(false);
          }
        } else if (serieId) {
          // --- LOGICA LEGA ---
          newRawData = await PlayerService.getPlayersByLeague(serieId, 2024, batchIndex);
          
          // Se arrivano meno di 20 giocatori, siamo all'ultima pagina
          if (!newRawData || newRawData.length < 20) {
            setHasMoreRemote(false);
          }
        } else {
          const globalBatchIndex = batchIndex - 1;
          newRawData = await PlayerService.getTopPlayersBatch(globalBatchIndex);
          
          if (!newRawData || newRawData.length === 0) {
            setHasMoreRemote(false);
          }
        }

        if (newRawData && newRawData.length > 0) {
          // Salva in cache (pagina specifica)
          if (!squadraId) {
             localStorage.setItem(cacheKey, JSON.stringify(newRawData));
          }

          const newPlayers = newRawData.map(item => new Player(item));
          setPlayers(prev => batchIndex === 1 ? newPlayers : [...prev, ...newPlayers]);
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
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serieId, squadraId, batchIndex]);

  // Funzione per chiedere la prossima pagina/batch
  const loadMore = useCallback(() => {
    if (!loading && hasMoreRemote && !squadraId) {
      console.log("📥 Richiesta pagina successiva...");
      setBatchIndex(prev => prev + 1);
    }
  }, [loading, hasMoreRemote, squadraId]);

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