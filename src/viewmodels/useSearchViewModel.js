/**
 * VIEWMODEL: useSearchViewModel.js
 * Custom Hook per la gestione della ricerca globale
 * Aggrega risultati da nazioni, squadre e giocatori gestendo il debounce dell'input e la priorità della cache
 */
import { useState, useEffect } from 'react';
import PlayerService from '../services/PlayerService';
import { Player } from '../models/Player';

export function useSearchViewModel(searchTerm) {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [nations, setNations] = useState([]); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!searchTerm || searchTerm.trim().length < 3) {
        setPlayers([]);
        setTeams([]);
        setNations([]);
        return;
      }

      setLoading(true);

      try {
        // RICERCA NAZIONI (Filtra la lista geografica)
        // Questo trova la "Nazione" per andare ai campionati
        let allNations = [];
        const nationsCache = localStorage.getItem('all_nations');
        
        if (nationsCache) {
          allNations = JSON.parse(nationsCache);
        } else {
          allNations = await PlayerService.getCountries();
          localStorage.setItem('all_nations', JSON.stringify(allNations));
        }
        
        const filteredNations = allNations.filter(n => 
          n.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setNations(filteredNations);

        //  RICERCA GIOCATORI (Logica Cache esistente) 
        let localPlayers = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('players_')) {
            try {
              const cachedData = JSON.parse(localStorage.getItem(key));
              if (Array.isArray(cachedData)) {
                const matches = cachedData.filter(p => 
                  p.player?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                );
                localPlayers = [...localPlayers, ...matches];
              }
            } catch (e) { console.warn(e); }
          }
        }
        
        const uniqueLocalPlayers = Array.from(
          new Map(localPlayers.map(item => [item.player.id, item])).values()
        );
        setPlayers(uniqueLocalPlayers.map(item => new Player(item)));

        //  RICERCA API (Squadre e Giocatori) 
        if (searchTerm.trim().length >= 3) {
          const [apiPlayersData, apiTeamsData] = await Promise.all([
            PlayerService.searchPlayers(searchTerm).catch(() => []),
            PlayerService.searchTeams(searchTerm).catch(() => [])
          ]);

          // Merge Giocatori
          if (apiPlayersData.length > 0) {
            const existingIds = new Set(uniqueLocalPlayers.map(p => p.player.id));
            const newApiPlayers = apiPlayersData.filter(p => 
              p.player?.id && !existingIds.has(p.player.id)
            );
            
            if (newApiPlayers.length > 0) {
              setPlayers(prev => [...prev, ...newApiPlayers.map(item => new Player(item))]);
            }
          }

          // Merge Squadre (Inclusa la mappatura per isNational)
          if (apiTeamsData.length > 0) {
            setTeams(apiTeamsData
              .filter(item => item.team && item.team.id)
              .map(item => ({
                id: item.team.id,
                name: item.team.name,
                logo: item.team.logo,
                country: item.team.country,
                isNational: item.team.national //  Cattura flag
              }))
            );
          }
        }

      } catch (error) {
        console.error("Errore ricerca:", error);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return { players, teams, nations, loading }; 
}