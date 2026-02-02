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

    // Se stiamo cercando la stessa cosa e abbiamo già risultati (nel componente vivo), non ripetere l'API
    if (lastSearchRef.current === term && (players.length > 0 || teams.length > 0)) {
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);

      // CONTROLLO CACHE DI SESSIONE 
      // Se abbiamo già cercato questo termine in questa sessione browser, carichiamo tutto da qui.
      const sessionKey = `search_sess_${term.toLowerCase()}`;
      const cachedSession = sessionStorage.getItem(sessionKey);

      if (cachedSession) {
        const data = JSON.parse(cachedSession);
        // Ripristiniamo lo stato. Nota: i giocatori devono essere ri-istanziati come oggetti Player
        setNations(data.nations || []);
        setTeams(data.teams || []);
        setPlayers((data.players || []).map(p => new Player(p)));
        
        lastSearchRef.current = term; // Allineiamo il ref
        setLoading(false);
        return; // Ci fermiamo qui, niente calcoli locali o API
      }

      try {
        // RICERCA LOCALE (localStorage) 
        let foundNations = [];
        const nationsData = localStorage.getItem('all_nations') || localStorage.getItem('cache_nations');
        if (nationsData) {
          foundNations = JSON.parse(nationsData).filter(n => 
            n.name.toLowerCase().includes(term.toLowerCase())
          );
          setNations(foundNations);
        }

        let localMatches = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('players_')) {
            const cachedData = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(cachedData)) {
              // Gestisce sia struttura diretta che wrapper { player: ... }
              const matches = cachedData.filter(p => {
                const name = p.name || p.player?.name;
                return name?.toLowerCase().includes(term.toLowerCase());
              });
              // Normalizza struttura dati per il costruttore Player
              localMatches = [...localMatches, ...matches];
            }
          }
        }
        
        // Deduplicazione locale
        const uniqueLocal = Array.from(new Map(localMatches.map(m => [m.player?.id || m.id, m])).values());
        let currentPlayers = uniqueLocal.map(item => new Player(item));
        setPlayers(currentPlayers);

        // RICERCA API 
        if (lastSearchRef.current !== term) {
          lastSearchRef.current = term;
          
          const [apiPlayersData, apiTeamsData] = await Promise.all([
            PlayerService.searchPlayers(term).catch(() => []),
            PlayerService.searchTeams(term).catch(() => [])
          ]);

          let finalPlayers = currentPlayers;
          let finalTeams = [];

          // Merge Giocatori
          if (apiPlayersData.length > 0) {
            const newPlayers = apiPlayersData.map(item => new Player(item));
            const combined = [...currentPlayers, ...newPlayers];
            // Deduplicazione finale (Locale + API)
            finalPlayers = Array.from(new Map(combined.map(p => [p.id, p])).values());
            setPlayers(finalPlayers);
          }

          // Setup Squadre
          if (apiTeamsData.length > 0) {
            finalTeams = apiTeamsData.map(item => ({
              id: item.team.id,
              name: item.team.name,
              logo: item.team.logo,
              country: item.team.country,
              isNational: item.team.national
            }));
            setTeams(finalTeams);
          }

          // Salva il risultato finale combinato
          sessionStorage.setItem(sessionKey, JSON.stringify({
            nations: foundNations,
            players: finalPlayers,
            teams: finalTeams
          }));
        }
      } catch (error) {
        console.error("Errore durante la ricerca:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchTerm]);

  return { players, teams, nations, loading }; 
}