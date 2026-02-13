/**
 * @module ViewModels/useTeamsViewModel
 * @description ViewModel React Hook per la gestione delle squadre (club) di un campionato.
 * 
 * Recupera l'elenco dei team partecipanti a una competizione specifica,
 * con caching persistente e deduplicazione richieste.
 * 
 * Pattern implementati:
 * - Cache-First Loading
 * - Request Deduplication via useRef
 * - URL-Driven State
 */

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import PlayerService from '../services/PlayerService';

/**
 * Hook per il recupero delle squadre di un campionato.
 * 
 * Flusso:
 * 1. Estrae `serieId` da URL params
 * 2. Verifica ref `lastRequestKey` per deduplicazione
 * 3. Controlla cache localStorage (`cache_teams_{serieId}`)
 * 4. Se assente, chiama API e persiste risultato
 * 
 * @function useTeamsViewModel
 * @returns {Object} Stato delle squadre
 * @returns {Array<Object>} return.teams - Squadre del campionato
 * @returns {number} return.teams[].team.id - ID univoco squadra
 * @returns {string} return.teams[].team.name - Nome squadra
 * @returns {string} return.teams[].team.logo - URL logo
 * @returns {boolean} return.loading - Flag di caricamento
 */
export function useTeamsViewModel() {
  /**
   * ID del campionato estratto dai parametri URL.
   * @type {string}
   */
  const { serieId } = useParams();

  /**
   * Array delle squadre caricate.
   * @type {Array}
   */
  const [teams, setTeams] = useState([]);

  /**
   * Flag di caricamento.
   * @type {Array}
   */
  const [loading, setLoading] = useState(true);

  /**
   * Ref per tracciare l'ultima richiesta e prevenire duplicati.
   */
  const lastRequestKey = useRef("");

  useEffect(() => {
    /**
     * Carica le squadre con Cache-First strategy.
     * 
     * @async
     * @private
     */
    const loadTeams = async () => {
      // Deduplicazione richieste
      if (lastRequestKey.current === serieId) return;
      lastRequestKey.current = serieId;

      const cacheKey = `cache_teams_${serieId}`;
      const cachedData = localStorage.getItem(cacheKey);

      // Caricamento da cache
      if (cachedData) {
        setTeams(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      // Caricamento da API
      try {
        setLoading(true);
        const data = await PlayerService.getTeams(serieId);
        setTeams(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTeams();
  }, [serieId]);

  return { teams, loading };
}