/**
 * VIEWMODEL: useSearchViewModel.js
 * Gestisce la ricerca globale di giocatori e squadre con strategia Cache-First
 */
import { useState, useEffect } from 'react';
import PlayerService from '../services/PlayerService';
import { Player } from '../models/Player';

export function useSearchViewModel(searchTerm) {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      // Se il termine di ricerca è troppo corto, pulisci i risultati e esci
      if (!searchTerm || searchTerm.trim().length < 3) {
        setPlayers([]);
        setTeams([]);
        return;
      }

      setLoading(true);

      // --- 1. RICERCA LOCALE (CACHE) ---
      let localPlayers = [];
      try {
        // Scansioniamo tutte le chiavi del localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          // Cerchiamo solo nelle chiavi che contengono giocatori (salvate precedentemente)
          if (key.startsWith('players_')) {
            try {
              const cachedData = JSON.parse(localStorage.getItem(key));
              if (Array.isArray(cachedData)) {
                // Filtriamo i giocatori che corrispondono alla ricerca
                const matches = cachedData.filter(p => 
                  p.player.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                localPlayers = [...localPlayers, ...matches];
              }
            } catch (parseError) {
              console.warn(`Errore parsing cache per chiave: ${key}`, parseError);
            }
          }
        }
      } catch (e) {
        console.warn("Errore generale lettura cache", e);
      }

      // Rimuoviamo duplicati locali (basandoci sull'ID del giocatore)
      const uniqueLocalPlayers = Array.from(
        new Map(localPlayers.map(item => [item.player.id, item])).values()
      );

      // Impostiamo subito i dati locali per dare un feedback immediato
      setPlayers(uniqueLocalPlayers.map(item => new Player(item)));
      
      // Estraiamo squadre dalla cache giocatori (trucco per avere squadre offline)
      const localTeamsNames = [...new Set(uniqueLocalPlayers.map(p => p.statistics[0].team.name))];
      const localTeamsObj = localTeamsNames.map((name, idx) => ({
         id: `local-team-${idx}`,
         name: name,
         logo: uniqueLocalPlayers.find(p => p.statistics[0].team.name === name)?.statistics[0].team.logo,
         country: 'Cache'
      }));
      setTeams(localTeamsObj);

      // --- 2. RICERCA API (FALLBACK SICURO) ---
      try {
        // Eseguiamo le chiamate API in parallelo
        // Usiamo .catch() su ogni promessa per evitare che il fallimento di una blocchi tutto
        const [apiPlayersData, apiTeamsData] = await Promise.all([
            PlayerService.searchPlayers(searchTerm).catch(err => {
                console.warn("API Search Players fallita:", err);
                return []; 
            }),
            PlayerService.searchTeams(searchTerm).catch(err => {
                console.warn("API Search Teams fallita:", err);
                return [];
            })
        ]);

        // Merge Giocatori: Uniamo API con Cache
        if (apiPlayersData && apiPlayersData.length > 0) {
            const existingIds = new Set(uniqueLocalPlayers.map(p => p.player.id));
            const newApiPlayers = apiPlayersData.filter(p => !existingIds.has(p.player.id));
            const combinedRaw = [...uniqueLocalPlayers, ...newApiPlayers];
            setPlayers(combinedRaw.map(item => new Player(item)));
        }

        // Merge Squadre: Priorità ai dati API se disponibili
        if (apiTeamsData && apiTeamsData.length > 0) {
             setTeams(apiTeamsData.map(item => ({
                id: item.team.id,
                name: item.team.name,
                logo: item.team.logo,
                country: item.team.country
            })));
        }
      } catch (globalApiError) {
        console.error("Errore critico durante la ricerca API:", globalApiError);
        // Non facciamo nulla qui: lo stato è già popolato con i dati della cache
        // quindi l'utente vedrà comunque qualcosa se disponibile.
      } finally {
        setLoading(false);
      }
    }, 500); // Debounce di 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return { players, teams, loading };
}