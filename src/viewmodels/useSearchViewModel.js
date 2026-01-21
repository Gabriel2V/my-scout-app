/**
 * VIEWMODEL: useSearchViewModel.js
 * Gestisce la ricerca globale di giocatori, squadre e nazioni con strategia Cache-First
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
        // --- 1. RICERCA NAZIONI (con cache dedicata) ---
        let allNations = [];
        const nationsCache = localStorage.getItem('all_nations');
        
        if (nationsCache) {
          // Usa cache se disponibile
          allNations = JSON.parse(nationsCache);
        } else {
          // Altrimenti carica e salva in cache
          allNations = await PlayerService.getCountries();
          localStorage.setItem('all_nations', JSON.stringify(allNations));
        }
        
        // Filtra nazioni localmente
        const filteredNations = allNations.filter(n => 
          n.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setNations(filteredNations);

        // --- 2. RICERCA GIOCATORI (cache locale) ---
        let localPlayers = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('players_')) {
            try {
              const cachedData = JSON.parse(localStorage.getItem(key));
              if (Array.isArray(cachedData)) {
                const matches = cachedData.filter(p => 
                  p.player && p.player.name && 
                  p.player.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                localPlayers = [...localPlayers, ...matches];
              }
            } catch (e) {
              console.warn(`Errore parsing cache ${key}:`, e);
            }
          }
        }
        
        // Rimuovi duplicati per ID
        const uniqueLocalPlayers = Array.from(
          new Map(localPlayers.map(item => [item.player.id, item])).values()
        );
        setPlayers(uniqueLocalPlayers.map(item => new Player(item)));

        // --- 3. RICERCA API (solo se ricerca > 3 caratteri per limitare chiamate) ---
        if (searchTerm.trim().length >= 3) {
          const [apiPlayersData, apiTeamsData] = await Promise.all([
            PlayerService.searchPlayers(searchTerm).catch(err => {
              console.warn("Errore ricerca API players:", err);
              return [];
            }),
            PlayerService.searchTeams(searchTerm).catch(err => {
              console.warn("Errore ricerca API teams:", err);
              return [];
            })
          ]);

          // Aggiungi giocatori API solo se non già presenti
          if (apiPlayersData.length > 0) {
            const existingIds = new Set(uniqueLocalPlayers.map(p => p.player.id));
            const newApiPlayers = apiPlayersData.filter(p => 
              p.player && p.player.id && !existingIds.has(p.player.id)
            );
            
            if (newApiPlayers.length > 0) {
              setPlayers(prev => [
                ...prev, 
                ...newApiPlayers.map(item => new Player(item))
              ]);
            }
          }

          // Imposta squadre da API
          if (apiTeamsData.length > 0) {
            setTeams(apiTeamsData
              .filter(item => item.team && item.team.id)
              .map(item => ({
                id: item.team.id,
                name: item.team.name,
                logo: item.team.logo,
                country: item.team.country
              }))
            );
          }
        }

      } catch (error) {
        console.error("Errore critico durante la ricerca:", error);
      } finally {
        setLoading(false);
      }
    }, 400); // Debounce ridotto a 400ms per ricerca più reattiva

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return { players, teams, nations, loading }; 
}