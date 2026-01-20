/**
 * VIEWMODEL: usePlayersViewModel.js
 * Gestisce la logica di recupero dati dinamica basata sui parametri della rotta.
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Necessario per leggere parametri come :serieId o :squadraId
import PlayerService from '../services/PlayerService';
import { Player } from '../models/Player';

export function usePlayersViewModel(externalSearchTerm = "") {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Recuperiamo i parametri definiti in App.jsx (serieId e squadraId)
  const { serieId, squadraId } = useParams();

  useEffect(() => {
    const loadPlayers = async () => {
      setLoading(true);

      // Definiamo una chiave di cache univoca per evitare collisioni tra diverse squadre/leghe
      const cacheKey = squadraId 
        ? `players_team_${squadraId}` 
        : serieId 
          ? `players_league_${serieId}` 
          : 'players_global';

      // 1. Controllo della Cache locale
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        console.log(`Caricamento da cache: ${cacheKey}`);
        const rawData = JSON.parse(cachedData);
        setPlayers(rawData.map(item => new Player(item)));
        setLoading(false);
        return;
      }

      // 2. Chiamata API dinamica in base al parametro presente
      try {
        console.log(`Richiesta API per: ${cacheKey}`);
        let rawData;

        if (squadraId) {
          // Carica i giocatori di una squadra specifica
          rawData = await PlayerService.getPlayersByTeam(squadraId);
        } else if (serieId) {
          // Carica i giocatori di una lega specifica
          rawData = await PlayerService.getPlayersByLeague(serieId);
        } else {
          // Caricamento di default (es. Serie A lega 135) se non ci sono parametri
          rawData = await PlayerService.getPlayersByLeague(135);
        }

        // 3. Salvataggio in cache e aggiornamento stato
        localStorage.setItem(cacheKey, JSON.stringify(rawData));
        setPlayers(rawData.map(item => new Player(item)));
      } catch (error) {
        console.error("Errore nel caricamento dei giocatori:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
    
    // Riesegue l'effetto se cambiano gli ID nell'URL
  }, [serieId, squadraId]); 

  // Logica di filtraggio per la ricerca testuale
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