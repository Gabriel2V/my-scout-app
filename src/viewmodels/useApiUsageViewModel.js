/**
 * @module ViewModels/useApiUsageViewModel
 * @description ViewModel per la dashboard di monitoraggio API con sincronizzazione real-time.
 */
import { useState, useEffect, useCallback } from 'react';
import PlayerService from '../services/PlayerService';

export function useApiUsageViewModel(refreshRate = 2000) {
  const [usage, setUsage] = useState(null);
  const [config] = useState(PlayerService.getApiConfig());
  const [isSyncing, setIsSyncing] = useState(false);

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

    // Refresh dal server ogni 30 secondi per sincronizzare eventuali aumenti esterni
    const serverInterval = setInterval(() => updateUsage(true), 30000);

    return () => {
      clearInterval(localInterval);
      clearInterval(serverInterval);
    };
  }, [refreshRate, updateUsage]);

  const resetCounter = () => {
    PlayerService.resetApiCounter();
    updateUsage(false);
  };

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