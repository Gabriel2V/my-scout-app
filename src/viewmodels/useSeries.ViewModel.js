/**
 * @module ViewModels/useSeriesViewModel
 * @description ViewModel React Hook per la gestione dei campionati (serie) di una nazione specifica.
 * 
 * Recupera l'elenco delle competizioni calcistiche disponibili per una nazione,
 * con strategia Cache-First e deduplicazione richieste tramite ref tracking.
 * 
 * **Pattern implementati:**
 * - Cache-First Loading
 * - Request Deduplication via useRef
 * - URL-Driven State (parametri React Router)
 * 
 */

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import PlayerService from '../services/PlayerService';

/**
 * Hook per il recupero dei campionati di una nazione.
 * 
 * **Flusso:**
 * 1. Estrae `nazioneId` da URL params
 * 2. Verifica ref `lastRequestKey` per evitare richieste duplicate
 * 3. Controlla cache localStorage
 * 4. Se assente, chiama API e salva risultato
 * 
 * @function useSeriesViewModel
 * @returns {Object} Stato dei campionati
 * @returns {Array<Object>} return.leagues - Campionati della nazione
 * @returns {boolean} return.loading - Flag di caricamento
 * @returns {string} return.nazioneId - Nome nazione da URL
 * 
 * @example
 * const { leagues, loading, nazioneId } = useSeriesViewModel();
 * // nazioneId: "Italy"
 * // leagues: [{ league: { id: 135, name: "Serie A", ... }, ... }]
 */
export function useSeriesViewModel() {
  /**
   * ID/nome della nazione estratto dai parametri URL.
   * @type {string}
   */
  const { nazioneId } = useParams();

  /**
   * Array dei campionati caricati.
   * @type {Array}
   */
  const [leagues, setLeagues] = useState([]);

  /**
   * Flag di caricamento.
   * @type {Array}
   */
  const [loading, setLoading] = useState(true);

  /**
   * Ref per tracciare l'ultima richiesta effettuata.
   * Previene chiamate duplicate quando il componente ri-renderizza.
   * @type {React.MutableRefObject<string>}
   */
  const lastRequestKey = useRef("");

  useEffect(() => {
    /**
     * Carica i campionati con strategia Cache-First e deduplicazione.
     * 
     * **Deduplicazione:**
     * Se `nazioneId` è uguale all'ultima richiesta, la funzione esce
     * immediatamente senza effettuare chiamate.
     * 
     * @async
     * @private
     */
    const loadLeagues = async () => {
      // Deduplicazione: evita richieste duplicate
      if (lastRequestKey.current === nazioneId) return;
      lastRequestKey.current = nazioneId;

      const cacheKey = `cache_series_${nazioneId}`;
      const cachedData = localStorage.getItem(cacheKey);

      // Tentativo di caricamento da cache
      if (cachedData) {
        setLeagues(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      // Caricamento da API
      try {
        setLoading(true);
        const data = await PlayerService.getLeagues(nazioneId);
        setLeagues(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLeagues();
  }, [nazioneId]);

  return { leagues, loading, nazioneId };
}