/**
 * @module ViewModels/usePlayerDetailViewModel
 * @description ViewModel per la vista di dettaglio. 
 * Gestisce il caricamento dei dati di un singolo giocatore tramite ID e la navigazione contestuale tra giocatori simili.
 */
import { useState, useEffect, useMemo } from 'react';
import PlayerService from '../services/PlayerService';
import { Player } from '../models/Player';

export function usePlayerDetailViewModel(id, initialPlayer, contextList = []) {
  // STATO DERIVATO (Sincrono)
  const cachedData = useMemo(() => {
    
    if (initialPlayer && initialPlayer.id != null && initialPlayer.id.toString() === id?.toString()) {
      return new Player(initialPlayer);
    }
    return null;
  }, [id, initialPlayer]);

  const [remotePlayer, setRemotePlayer] = useState(null);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState(null);

  // Il giocatore attivo è quello della cache (se presente) o quello remoto
  const player = cachedData || remotePlayer;

  //  LOGICA DI NAVIGAZIONE 
  // Calcoliamo chi sono prev e next basandoci sulla lista passata
  const { prevPlayer, nextPlayer } = useMemo(() => {
    if (!player || !contextList || contextList.length === 0) {
      return { prevPlayer: null, nextPlayer: null };
    }
    

    const index = contextList.findIndex(p => 
      p?.id != null && 
      player.id != null && 
      p.id.toString() === player.id.toString()
    );
    
    return {
      prevPlayer: index > 0 ? new Player(contextList[index - 1]) : null,
      nextPlayer: index !== -1 && index < contextList.length - 1 ? new Player(contextList[index + 1]) : null
    };
  }, [player, contextList]);

  // SIDE EFFECT (Solo per accesso diretto via URL)
  useEffect(() => {
    // Se abbiamo cachedData, il Service è escluso.
    if (cachedData) {
      setLoading(false);
      setError(null);
      return;
    }

    const loadFromService = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = [];
        if (PlayerService.getPlayerById) {
           data = await PlayerService.getPlayerById(id);
        }
        
        if (Array.isArray(data) && data.length > 0) {
           setRemotePlayer(new Player(data[0]));
        } else {
           setError("Giocatore non trovato.");
        }
      } catch (err) {
        console.error(err);
        setError("Impossibile caricare i dati.");
      } finally {
        setLoading(false);
      }
    };

    loadFromService();
  }, [id, cachedData]); 

  return { player, prevPlayer, nextPlayer, loading, error };
}