/**
 * @module ViewModels/useSearchViewModel
 * @description ViewModel per la gestione della ricerca globale nell'applicazione.
 * Implementa una strategia di Ricerca Ibrida "a Imbuto" (Local + Remote):
 * 1. Scansione Locale: Cerca immediatamente corrispondenze nel localStorage (dati già visitati).
 * 2. Session Cache: Memorizza i risultati della ricerca corrente in sessionStorage per navigazione "Instant Back".
 * 3. API Fetch (Imbuto): Cerca prima le Squadre; se viene specificato un giocatore, usa gli ID delle squadre trovate per cercare il giocatore specifico, bypassando le limitazioni dell'API esterna.
 * Gestisce l'aggregazione di Nazioni, Squadre e Giocatori in un unico result set.
 */
import { useState, useEffect, useRef } from 'react';
import PlayerService from '../services/PlayerService';
import { Player } from '../models/Player';

/**
 * Hook per la logica di ricerca.
 * @function useSearchViewModel
 * @param {string} searchTerm - Il termine di ricerca principale (Squadra/Nazione).
 * @param {string} [playerTerm=""] - Il termine di ricerca opzionale per il giocatore.
 * @returns {Object} Risultati della ricerca.
 * @returns {Array<Player>} return.players - Lista giocatori trovati (istanze Player).
 * @returns {Array<Object>} return.teams - Lista squadre trovate.
 * @returns {Array<Object>} return.nations - Lista nazioni trovate.
 * @returns {boolean} return.loading - Flag di caricamento.
 */
export function useSearchViewModel(searchTerm, playerTerm = "") {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [nations, setNations] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  const lastSearchRef = useRef("");

  useEffect(() => {
    const term = searchTerm?.trim() || "";
    const pTerm = playerTerm?.trim() || "";
    const combinedSearchKey = `${term}-${pTerm}`;
    
    // Minimo 3 caratteri per attivare la ricerca principale
    if (term.length < 3) {
      setPlayers([]);
      setTeams([]);
      setNations([]);
      lastSearchRef.current = "";
      setLoading(false);
      return;
    }

    // Check: se stiamo cercando la stessa identica cosa e abbiamo già risultati
    if (lastSearchRef.current === combinedSearchKey && (players.length > 0 || teams.length > 0)) {
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      const sessionKey = `search_sess_${term.toLowerCase()}_${pTerm.toLowerCase()}`;
      const cachedSession = sessionStorage.getItem(sessionKey);

      if (cachedSession) {
        const data = JSON.parse(cachedSession);
        // Ripristina lo stato
        setNations(data.nations || []);
        setTeams(data.teams || []);
        setPlayers((data.players || []).map(p => new Player(p)));
        
        lastSearchRef.current = combinedSearchKey; 
        setLoading(false);
        return; 
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

        // Scansiona tutte le chiavi 'players_' nel localStorage
        let localMatches = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('players_')) {
            const cachedData = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(cachedData)) {
              // Filtra per nome (usiamo pTerm se fornito, altrimenti term)
              const searchForPlayer = pTerm.length > 0 ? pTerm : term;
              const matches = cachedData.filter(p => {
                const name = p.name || p.player?.name;
                return name?.toLowerCase().includes(searchForPlayer.toLowerCase());
              });
              localMatches = [...localMatches, ...matches];
            }
          }
        }
        
        // Deduplicazione locale e istanziazione Model
        const uniqueLocal = Array.from(new Map(localMatches.map(m => [m.player?.id || m.id, m])).values());
        let currentPlayers = uniqueLocal.map(item => new Player(item));
        setPlayers(currentPlayers);

        //  RICERCA REMOTA API 
        if (lastSearchRef.current !== combinedSearchKey) {
          lastSearchRef.current = combinedSearchKey;
          
          // Chiamata solo per le Squadre usando term
          const apiTeamsData = await PlayerService.searchTeams(term).catch(() => []);

          let finalPlayers = currentPlayers;
          let finalTeams = [];

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

            // Se l'utente ha compilato la seconda barra (Giocatore)
            if (pTerm.length >= 3) {
              // Prende al massimo i primi 3 team trovati per evitare troppe chiamate API
              const topTeamsToSearch = apiTeamsData.slice(0, 3);
              
              // Esegue le ricerche in parallelo per il giocatore specifico in quelle 3 squadre
              const playerRequests = topTeamsToSearch.map(t => 
                PlayerService.searchPlayerInTeam(pTerm, t.team.id).catch(() => [])
              );
              
              const playersResults = await Promise.all(playerRequests);
              
              // Appiattisce i risultati e li converte in oggetti Player
              const newPlayers = playersResults.flat().map(item => new Player(item));
              
              // Unisce con eventuali giocatori trovati nella cache locale e rimuoviamo duplicati
              const combined = [...currentPlayers, ...newPlayers];
              finalPlayers = Array.from(new Map(combined.map(p => [p.id, p])).values());
              setPlayers(finalPlayers);
            }
          } else {
             // Se non ci sono team dall'API, mantieni i team vuoti e i player trovati in locale
             setTeams([]);
             setPlayers(currentPlayers);
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
  }, [searchTerm, playerTerm]);

  return { players, teams, nations, loading }; 
}