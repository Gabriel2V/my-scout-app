/**
 * @module ViewModels/useApiUsageViewModel
 * @description ViewModel per la dashboard di monitoraggio API.
 * Gestisce la sincronizzazione in tempo reale (polling) dei consumi tra client e server.
 * * @param {number} [refreshRate=2000] - Intervallo in millisecondi per l'aggiornamento locale dell'UI.
 * @returns {Object} Stato e metodi di gestione API.
 */
import { useState, useEffect, useCallback } from 'react';
import PlayerService from '../services/PlayerService';

export function useApiUsageViewModel(refreshRate = 2000) {
  const [usage, setUsage] = useState(null);
  const [config] = useState(PlayerService.getApiConfig());
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Aggiorna i dati di utilizzo.
   * @param {boolean} [forceSync=false] - Se true, forza una chiamata al server (/status).
   */
  const updateUsage = useCallback(async (forceSync = false) => {
    if (forceSync) setIsSyncing(true);
    
    // syncUsageWithApi implementa la logica: aggiorna solo se server > locale
    const data = forceSync 
      ? await PlayerService.syncUsageWithApi() 
      : PlayerService.getApiUsage();
    
    setUsage(data);
    if (forceSync) setIsSyncing(false);
  }, []);

  useEffect(() => {
    // Sincronizzazione iniziale al mount
    updateUsage(true);

    // Refresh locale veloce per la UI (contatore interno)
    const localInterval = setInterval(() => updateUsage(false), refreshRate);

    // Refresh dal server ogni 15 secondi per sincronizzare eventuali aumenti esterni
    const serverInterval = setInterval(() => updateUsage(true), 15000);

    return () => {
      clearInterval(localInterval);
      clearInterval(serverInterval);
    };
  }, [refreshRate, updateUsage]);

  /** Resetta il contatore locale e aggiorna la UI */
  const resetCounter = () => {
    PlayerService.resetApiCounter();
    updateUsage(false);
  };

  /** * Rimuove tutte le chiavi di cache relative ai giocatori.
   * @returns {number} Numero di chiavi rimosse.
   */
  const clearCache = () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('players_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return keysToRemove.length;
  };

  return { usage, config, isSyncing, resetCounter, clearCache, syncWithServer: () => updateUsage(true) };
}