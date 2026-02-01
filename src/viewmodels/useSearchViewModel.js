/**
 * VIEWMODEL: useSearchViewModel.js
 * Custom Hook per la gestione della ricerca globale
 * Aggrega risultati da nazioni, squadre e giocatori gestendo il debounce dell'input e la priorità della cache
 */
import { useState, useEffect, useRef } from 'react';
import PlayerService from '../services/PlayerService';
import { Player } from '../models/Player';

export function useSearchViewModel(searchTerm) {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [nations, setNations] = useState([]); 
  const [loading, setLoading] = useState(false);
  const lastSearchRef = useRef("");

  useEffect(() => {
    const term = searchTerm?.trim() || "";
    
    if (term.length < 3) {
      setPlayers([]);
      setTeams([]);
      setNations([]);
      lastSearchRef.current = "";
      setLoading(false);
      return;
    }

    // Se stiamo cercando la stessa cosa e abbiamo già risultati, non ripetere l'API
    if (lastSearchRef.current === term && (players.length > 0 || teams.length > 0)) {
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        // RICERCA LOCALE (Sempre eseguita se lo stato è vuoto)
        const nationsData = localStorage.getItem('all_nations') || localStorage.getItem('cache_nations');
        if (nationsData) {
          const filtered = JSON.parse(nationsData).filter(n => n.name.toLowerCase().includes(term.toLowerCase()));
          setNations(filtered);
        }

        let localMatches = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('players_')) {
            const data = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(data)) {
              const matches = data.filter(p => (p.player?.name || p.name)?.toLowerCase().includes(term.toLowerCase()));
              localMatches = [...localMatches, ...matches];
            }
          }
        }
        const uniqueLocal = Array.from(new Map(localMatches.map(m => [m.player?.id || m.id, m])).values());
        setPlayers(uniqueLocal.map(item => new Player(item)));

        // Se abbiamo già fatto questa ricerca remota, non chiamare l'API
        if (lastSearchRef.current !== term) {
          lastSearchRef.current = term;
          const [apiPlayersData, apiTeamsData] = await Promise.all([
            PlayerService.searchPlayers(term).catch(() => []),
            PlayerService.searchTeams(term).catch(() => [])
          ]);

          if (apiPlayersData.length > 0) {
            const newPlayers = apiPlayersData.map(item => new Player(item));
            setPlayers(prev => {
              const combined = [...prev, ...newPlayers];
              return Array.from(new Map(combined.map(p => [p.id, p])).values());
            });
          }

          if (apiTeamsData.length > 0) {
            setTeams(apiTeamsData.map(item => ({
              id: item.team.id,
              name: item.team.name,
              logo: item.team.logo,
              country: item.team.country,
              isNational: item.team.national
            })));
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchTerm]);

  return { players, teams, nations, loading }; 
}