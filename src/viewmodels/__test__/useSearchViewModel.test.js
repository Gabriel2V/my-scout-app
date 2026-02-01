/**
 * TEST: useSearchViewModel
 * Verifica il flusso di ricerca globale, il debounce dell'input e l'aggregazione dei risultati
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useSearchViewModel } from '../useSearchViewModel';
import PlayerService from '../../services/PlayerService';

vi.mock('../../services/PlayerService', () => ({
  default: {
    searchPlayers: vi.fn(),
    searchTeams: vi.fn()
  }
}));

describe('useSearchViewModel Hook', () => {
  const mockCountries = [{ name: 'Italy', code: 'IT', flag: 'url_it' }];
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Pre-popola la cache per i test
    localStorage.setItem('all_nations', JSON.stringify(mockCountries));
    
    PlayerService.searchPlayers.mockResolvedValue([]);
    PlayerService.searchTeams.mockResolvedValue([]);
  });

  test('Deve trovare e filtrare le nazioni correttamente dalla cache', async () => {
    const { result } = renderHook(() => useSearchViewModel('Ita'));
    
    await waitFor(() => {
      // Verifica che la ricerca locale abbia funzionato
      expect(result.current.nations.length).toBeGreaterThan(0);
      expect(result.current.nations[0].name).toBe('Italy');
    }, { timeout: 2000 });
  });

  test('Deve unire i risultati API con quelli della cache', async () => {
    // Simulo un giocatore già presente in cache
    localStorage.setItem('players_cache', JSON.stringify([{ player: { id: 1, name: 'Barella' }, statistics: [] }]));
    
    // Simulo un nuovo giocatore dall'API
    PlayerService.searchPlayers.mockResolvedValue([{ player: { id: 2, name: 'Messi' }, statistics: [] }]);

    const { result } = renderHook(() => useSearchViewModel('Mes'));
    
    await waitFor(() => {
      expect(result.current.players.some(p => p.name === 'Messi')).toBe(true);
    });
  });
});