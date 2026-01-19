/**
 * VIEWMODEL: UsePlayersViewModel.js
 * Funge da collante tra il Model e la View
 * Gestisce lo stato reattivo e il filtraggio dei dati
 */
import { useState, useEffect } from 'react';
import PlayerService from '../services/PlayerService';
import { Player } from '../models/Player';

export function usePlayersViewModel() {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Caricamento dati al mounting del componente 
    const loadPlayers = async () => {
      const rawData = await PlayerService.getPlayers();
      // Mapping dei dati grezzi in istanze del Modello 
      const playerModels = rawData.map(item => new Player(item));
      setPlayers(playerModels);
      setLoading(false);
    };
    loadPlayers();
  }, []); // Array di dipendenze vuoto per esecuzione singola

  // Logica di filtraggio per la ricerca
  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    players: filteredPlayers,
    searchTerm,
    setSearchTerm,
    loading
  };
}