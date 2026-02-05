/**
 * @module ViewModels/usePlayerDetailViewModel
 * @description ViewModel React Hook per la vista di dettaglio di un singolo giocatore.
 * 
 * Implementa il pattern **"Zero-Network Navigation"**: se il giocatore è già disponibile
 * tramite stato passato (navigation state), non effettua chiamate API.
 * 
 * **Responsabilità principali:**
 * 1. Gestione dual-source: dati passati via state OR fetch remoto
 * 2. Calcolo navigazione contestuale (prev/next player)
 * 3. Re-idratazione oggetti Player da context list
 * 
 * **Pattern implementati:**
 * - Zero-Network Navigation: priorità ai dati passati via Router
 * - Contextual Navigation: prev/next calcolati da lista origine
 * - Lazy Remote Fetch: API solo per accesso diretto URL
 * 
 */

import { useState, useEffect, useMemo } from 'react';
import PlayerService from '../services/PlayerService';
import { Player } from '../models/Player';

/**
 * Hook per la gestione del dettaglio giocatore con navigazione contestuale.
 * 
 * **Modalità di funzionamento:**
 * 
 * **Caso A - Navigation State presente (Zero-Network):**
 * - `initialPlayer` contiene il giocatore
 * - Nessuna chiamata API
 * - Loading = false immediatamente
 * 
 * **Caso B - Accesso diretto URL (Remote Fetch):**
 * - `initialPlayer` è null/undefined
 * - Effettua chiamata API tramite PlayerService
 * - Loading = true fino a completamento
 * 
 * @function usePlayerDetailViewModel
 * @param {string|number} id - ID del giocatore da visualizzare
 * @param {Object} [initialPlayer] - Giocatore passato via navigation state
 * @param {Array<Object>} [contextList=[]] - Lista di giocatori per navigazione prev/next
 * @returns {Object} Stato del dettaglio giocatore
 * @returns {Player|null} return.player - Giocatore corrente (istanza normalizzata)
 * @returns {Player|null} return.prevPlayer - Giocatore precedente nella lista o null
 * @returns {Player|null} return.nextPlayer - Giocatore successivo nella lista o null
 * @returns {boolean} return.loading - True durante fetch remoto
 * @returns {string|null} return.error - Messaggio errore o null
 * 
 * @example
 * // Con navigation state (zero latency)
 * const { player, loading } = usePlayerDetailViewModel(
 *   276,
 *   { id: 276, name: "Lautaro Martinez", ... },
 *   []
 * );
 * // loading: false (immediato)
 * // player: Player { id: 276, name: "Lautaro Martinez", ... }
 * 
 * @example
 * // Accesso diretto URL (fetch remoto)
 * const { player, loading, error } = usePlayerDetailViewModel(276);
 * // loading: true → false dopo fetch
 * // player: null → Player { ... } dopo fetch
 */
export function usePlayerDetailViewModel(id, initialPlayer, contextList = []) {
  /**
   * Stato derivato sincronamente dai parametri.
   * Usa useMemo per evitare ricalcoli inutili.
   * 
   * Se `initialPlayer` è presente e ha ID matching, lo normalizza come Player.
   * Altrimenti ritorna null e delega al fetch remoto.
   * 
   * @type {Player|null}
   */
  const cachedData = useMemo(() => {
    if (initialPlayer && initialPlayer.id != null && initialPlayer.id.toString() === id?.toString()) {
      return new Player(initialPlayer);
    }
    return null;
  }, [id, initialPlayer]);

  /**
   * Giocatore caricato da API remota (solo per accesso diretto URL).
   * @type {Array}
   */
  const [remotePlayer, setRemotePlayer] = useState(null);

  /**
   * Flag di caricamento.
   * Inizializzato a false se cachedData presente, true altrimenti.
   * @type {Array}
   */
  const [loading, setLoading] = useState(!cachedData);

  /**
   * Messaggio di errore in caso di fetch fallito.
   * @type {Array}
   */
  const [error, setError] = useState(null);

  /**
   * Giocatore attivo: priorità a cachedData, fallback su remotePlayer.
   * @type {Player|null}
   */
  const player = cachedData || remotePlayer;

  /**
   * Calcolo navigazione contestuale (prev/next).
   * 
   * **Algoritmo:**
   * 1. Trova l'indice del giocatore corrente nella contextList
   * 2. prevPlayer: elemento a index-1 (se esiste)
   * 3. nextPlayer: elemento a index+1 (se esiste)
   * 4. Re-idratalazza come istanze Player
   * 
   * @type {{ prevPlayer: Player|null, nextPlayer: Player|null }}
   */
  const { prevPlayer, nextPlayer } = useMemo(() => {
    if (!player || !contextList || contextList.length === 0) {
      return { prevPlayer: null, nextPlayer: null };
    }

    // Trova indice del giocatore corrente
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

  /**
   * Effect per fetch remoto (solo se cachedData assente).
   * 
   * Se cachedData è presente, l'effect esce immediatamente senza chiamate API.
   */
  useEffect(() => {
    // Early return: se abbiamo cachedData, il Service è escluso
    if (cachedData) {
      setLoading(false);
      setError(null);
      return;
    }

    /**
     * Carica il giocatore da API remota.
     * 
     * **Nota:** PlayerService.getPlayerById potrebbe non esistere nell'implementazione
     * corrente (l'API Football non ha endpoint per singolo ID). Questo è un placeholder
     * per futura implementazione o fallback su search.
     * 
     * @async
     * @private
     */
    const loadFromService = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = [];
        
        // Tentativo di fetch diretto (se implementato)
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