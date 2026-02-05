/**
 * @module ViewModels/useSearchViewModel
 * @description ViewModel per la gestione della ricerca globale nell'applicazione.
 * * Implementa una strategia di **Ricerca Ibrida (Local + Remote)**:
 * 1. **Scansione Locale:** Cerca immediatamente corrispondenze nel localStorage (dati già visitati).
 * 2. **Session Cache:** Memorizza i risultati della ricerca corrente in sessionStorage per navigazione "Instant Back".
 * 3. **API Fetch:** Esegue chiamate remote in parallelo solo se necessario.
 * * Gestisce l'aggregazione di Nazioni, Squadre e Giocatori in un unico result set.
 */
import { useState, useEffect, useRef } from 'react';
import PlayerService from '../services/PlayerService';
import { Player } from '../models/Player';

/**
 * Hook per la logica di ricerca.
 * * @function useSearchViewModel
 * @param {string} searchTerm - Il termine di ricerca inserito dall'utente.
 * @returns {Object} Risultati della ricerca.
 * @returns {Array<Player>} return.players - Lista giocatori trovati (istanze Player).
 * @returns {Array<Object>} return.teams - Lista squadre trovate.
 * @returns {Array<Object>} return.nations - Lista nazioni trovate.
 * @returns {boolean} return.loading - Flag di caricamento.
 */
export function useSearchViewModel(searchTerm) {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [nations, setNations] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  const lastSearchRef = useRef("");

  useEffect(() => {
    const term = searchTerm?.trim() || "";
    
    // Minimo 3 caratteri per attivare la ricerca
    if (term.length < 3) {
      setPlayers([]);
      setTeams([]);
      setNations([]);
      lastSearchRef.current = "";
      setLoading(false);
      return;
    }

    // Debounce/Check: se stiamo cercando la stessa cosa e abbiamo già risultati
    if (lastSearchRef.current === term && (players.length > 0 || teams.length > 0)) {
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);

      // --- CONTROLLO CACHE DI SESSIONE ---
      // Se abbiamo già cercato questo termine in questa sessione browser, recuperiamo lo stato.
      const sessionKey = `search_sess_${term.toLowerCase()}`;
      const cachedSession = sessionStorage.getItem(sessionKey);

      if (cachedSession) {
        const data = JSON.parse(cachedSession);
        // Ripristiniamo lo stato. Nota: i giocatori devono essere ri-istanziati come oggetti Player
        setNations(data.nations || []);
        setTeams(data.teams || []);
        setPlayers((data.players || []).map(p => new Player(p)));
        
        lastSearchRef.current = term; 
        setLoading(false);
        return; 
      }

      try {
        // --- 1. RICERCA LOCALE (localStorage) ---
        let foundNations = [];
        const nationsData = localStorage.getItem('all_nations') || localStorage.getItem('cache_nations');
        if (nationsData) {
          foundNations = JSON.parse(nationsData).filter(n => 
            n.name.toLowerCase().includes(term.toLowerCase())
          );
          setNations(foundNations);
        }

        // Scansiona tutte le chiavi 'players_' nel localStorage
        let localMatches = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('players_')) {
            const cachedData = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(cachedData)) {
              // Filtra per nome
              const matches = cachedData.filter(p => {
                const name = p.name || p.player?.name;
                return name?.toLowerCase().includes(term.toLowerCase());
              });
              localMatches = [...localMatches, ...matches];
            }
          }
        }
        
        // Deduplicazione locale e istanziazione Model
        const uniqueLocal = Array.from(new Map(localMatches.map(m => [m.player?.id || m.id, m])).values());
        let currentPlayers = uniqueLocal.map(item => new Player(item));
        setPlayers(currentPlayers);

        // --- 2. RICERCA REMOTA API ---
        if (lastSearchRef.current !== term) {
          lastSearchRef.current = term;
          
          // Chiamate parallele per Giocatori e Squadre
          const [apiPlayersData, apiTeamsData] = await Promise.all([
            PlayerService.searchPlayers(term).catch(() => []),
            PlayerService.searchTeams(term).catch(() => [])
          ]);

          let finalPlayers = currentPlayers;
          let finalTeams = [];

          // Merge risultati Giocatori
          if (apiPlayersData.length > 0) {
            const newPlayers = apiPlayersData.map(item => new Player(item));
            const combined = [...currentPlayers, ...newPlayers];
            // Deduplicazione finale (Locale + API)
            finalPlayers = Array.from(new Map(combined.map(p => [p.id, p])).values());
            setPlayers(finalPlayers);
          }

          // Merge risultati Squadre
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

          // Persistenza Sessione
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