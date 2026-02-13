/** 
 * @file useSearchViewModel.test.js 
 * @description Test per la logica di ricerca globale, verificando la corretta integrazione tra risultati locali (cache) e remoti (API) tramite il nuovo sistema a imbuto. 
*/
import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useSearchViewModel } from '../useSearchViewModel';
import PlayerService from '../../services/PlayerService';
vi.mock('../../services/PlayerService', () => ({
  default: {
    searchPlayers: vi.fn(),
    searchTeams: vi.fn(),
    searchPlayerInTeam: vi.fn() 
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
    PlayerService.searchPlayerInTeam.mockResolvedValue([]);
  });

  test('Deve trovare e filtrare le nazioni correttamente dalla cache', async () => {
    const { result } = renderHook(() => useSearchViewModel('Ita'));
    
    await waitFor(() => {
      expect(result.current.nations.length).toBeGreaterThan(0);
      expect(result.current.nations[0].name).toBe('Italy');
    }, { timeout: 2000 });
  });

  test('Deve unire i risultati API con quelli della cache tramite ricerca a imbuto', async () => {
    localStorage.setItem('players_cache', JSON.stringify([{ player: { id: 1, name: 'Mesto' }, statistics: [] }]));
    PlayerService.searchTeams.mockResolvedValue([{ team: { id: 10, name: 'Inter Miami', logo: 'url', country: 'USA' } }]);
    PlayerService.searchPlayerInTeam.mockResolvedValue([{ player: { id: 2, name: 'Messi' }, statistics: [] }]);
    const { result } = renderHook(() => useSearchViewModel('Inter', 'Mes'));
    
    await waitFor(() => {
      expect(result.current.players.some(p => p.name === 'Messi')).toBe(true);
      expect(result.current.players.some(p => p.name === 'Mesto')).toBe(true);
    });
  });
});