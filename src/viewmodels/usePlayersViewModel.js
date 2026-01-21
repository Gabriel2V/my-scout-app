/**
 * VIEWMODEL: usePlayersViewModel.js
 * Gestisce la logica di recupero dati dinamica basata sui parametri della rotta
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PlayerService from '../services/PlayerService';
import { Player } from '../models/Player';

export function usePlayersViewModel(externalSearchTerm = "") {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const { serieId, squadraId } = useParams();

  useEffect(() => {
    const loadPlayers = async () => {
      setLoading(true);

      // Definisci la chiave di cache in base al contesto
      const cacheKey = squadraId 
        ? `players_team_${squadraId}` 
        : serieId 
          ? `players_league_${serieId}` 
          : 'players_global_top'; // Nuova chiave per top players

      // 1. Controllo della Cache locale
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        console.log(`✓ Caricamento da cache: ${cacheKey}`);
        const rawData = JSON.parse(cachedData);
        setPlayers(rawData.map(item => new Player(item)));
        setLoading(false);
        return;
      }

      // 2. Chiamata API dinamica
      try {
        console.log(`⟳ Richiesta API per: ${cacheKey}`);
        let rawData;

        if (squadraId) {
          // Giocatori di una squadra specifica
          rawData = await PlayerService.getPlayersByTeam(squadraId);
        } else if (serieId) {
          // Giocatori di una lega specifica
          rawData = await PlayerService.getPlayersByLeague(serieId);
        } else {
          // NOVITÀ: Carica i top players globali (mix di top scorers e assists)
          // Questo usa 6 chiamate API ma ti dà i giocatori più rilevanti
          rawData = await PlayerService.getTopPlayers();
        }

        // 3. Salvataggio in cache
        localStorage.setItem(cacheKey, JSON.stringify(rawData));
        setPlayers(rawData.map(item => new Player(item)));
        
      } catch (error) {
        console.error("❌ Errore nel caricamento dei giocatori:", error);
        
        // Fallback: se tutto fallisce, prova almeno la Premier League
        if (!squadraId && !serieId) {
          try {
            const fallbackData = await PlayerService.getPlayersByLeague(39);
            localStorage.setItem(cacheKey, JSON.stringify(fallbackData));
            setPlayers(fallbackData.map(item => new Player(item)));
          } catch (fallbackError) {
            console.error("❌ Anche il fallback è fallito:", fallbackError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
    
  }, [serieId, squadraId]); 

  // Filtraggio per searchTerm
  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(externalSearchTerm.toLowerCase())
  );

  return {
    players: filteredPlayers,
    searchTerm,
    setSearchTerm,
    loading
  };
}