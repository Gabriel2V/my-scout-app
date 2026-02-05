/**
 * @module ViewModels/useApiUsageViewModel
 * @description ViewModel per la dashboard di monitoraggio API.
 * Fornisce dati in tempo reale sull'utilizzo dei crediti e funzioni di manutenzione del database locale.
 */
import { useState, useEffect, useCallback } from 'react';
import PlayerService from '../services/PlayerService';

export function useApiUsageViewModel(refreshRate = 2000) {
  const [usage, setUsage] = useState(null);
  const [config] = useState(PlayerService.getApiConfig());

  const updateUsage = useCallback(() => {
    const data = PlayerService.getApiUsage();
    setUsage(data);
  }, []);

  useEffect(() => {
    updateUsage();
    if (refreshRate > 0) {
      const interval = setInterval(updateUsage, refreshRate);
      return () => clearInterval(interval);
    }
  }, [refreshRate, updateUsage]);

  const resetCounter = () => {
    PlayerService.resetApiCounter();
    updateUsage();
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

  return { usage, config, resetCounter, clearCache, refreshUsage: updateUsage };
}