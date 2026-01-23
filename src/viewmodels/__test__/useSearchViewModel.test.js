/**
 * TEST: useSearchViewModel
 * Verifica il flusso di ricerca globale, il debounce dell'input e l'aggregazione dei risultati
 */
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { useSearchViewModel } from '../useSearchViewModel';
import PlayerService from '../../services/PlayerService';

vi.mock('../../services/PlayerService', () => ({
  default: {
    getCountries: vi.fn(),
    searchPlayers: vi.fn(),
    searchTeams: vi.fn()
  }
}));

describe('useSearchViewModel Hook', () => {
  const mockCountries = [{ name: 'Italy', code: 'IT', flag: 'url_it' }];
  const mockCachedPlayers = [{ 
    player: { id: 10, name: 'Alessandro Del Piero' }, 
    statistics: [{ team: { name: 'Juve' }, games: { rating: '8.5' } }] 
  }];

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    PlayerService.getCountries.mockResolvedValue(mockCountries);
    PlayerService.searchPlayers.mockResolvedValue([]);
    PlayerService.searchTeams.mockResolvedValue([]);
  });

  afterEach(() => { vi.useRealTimers(); });

  test('Non deve eseguire ricerche se il termine è inferiore a 3 caratteri', async () => {
    const { result } = renderHook(() => useSearchViewModel('It'));
    await act(async () => { vi.advanceTimersByTime(500); });
    expect(result.current.nations).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  test('Deve trovare e filtrare le nazioni correttamente', async () => {
    const { result } = renderHook(() => useSearchViewModel('Ita'));
    await act(async () => { vi.advanceTimersByTime(500); });
    await waitFor(() => {
      expect(result.current.nations[0].name).toBe('Italy');
    });
  });

  test('Deve unire i risultati della cache locale con quelli dell API', async () => {
    localStorage.setItem('players_local', JSON.stringify(mockCachedPlayers));
    PlayerService.searchPlayers.mockResolvedValue([{
      player: { id: 20, name: 'Alessandro Bastoni' },
      statistics: [{ team: { name: 'Inter' }, games: { rating: '7.5' } }]
    }]);

    const { result } = renderHook(() => useSearchViewModel('Ale'));
    await act(async () => { vi.advanceTimersByTime(500); });
    await waitFor(() => {
      expect(result.current.players.length).toBe(2);
    });
  });

  test('Deve trovare le squadre tramite API', async () => {
    PlayerService.searchTeams.mockResolvedValue([{ team: { id: 1, name: 'Inter Miami' } }]);
    const { result } = renderHook(() => useSearchViewModel('Inter'));
    await act(async () => { vi.advanceTimersByTime(500); });
    await waitFor(() => {
      expect(result.current.teams[0].name).toBe('Inter Miami');
    });
  });

  test('Deve gestire il fallimento delle API senza crashare', async () => {
    PlayerService.getCountries.mockRejectedValue(new Error('Error'));
    const { result } = renderHook(() => useSearchViewModel('Test'));
    await act(async () => { vi.advanceTimersByTime(500); });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.nations).toEqual([]);
    });
  });
});