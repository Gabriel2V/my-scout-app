/** 
 * @file useApiUsageViewModel.test.js
 * @description Test per il monitoraggio dei consumi API, verificando la sincronizzazione e le funzioni di manutenzione.
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useApiUsageViewModel } from '../useApiUsageViewModel';
import PlayerService from '../../services/PlayerService';

vi.mock('../../services/PlayerService', () => ({
  default: {
    getApiUsage: vi.fn(),
    getApiConfig: vi.fn(() => ({ baseUrl: 'https://api.test', isConfigured: true })),
    syncUsageWithApi: vi.fn(),
    resetApiCounter: vi.fn()
  }
}));

describe('useApiUsageViewModel', () => {
  const mockUsage = { used: 10, limit: 100, percentage: 10 };
  const mockSyncUsage = { used: 25, limit: 100, percentage: 25 };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    PlayerService.getApiUsage.mockReturnValue(mockUsage);
    PlayerService.syncUsageWithApi.mockResolvedValue(mockSyncUsage);
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('Deve sincronizzarsi con il server all\'avvio', async () => {
    const { result } = renderHook(() => useApiUsageViewModel());
    
    expect(result.current.isSyncing).toBe(true);

    await waitFor(() => {
      expect(result.current.usage).toEqual(mockSyncUsage);
    });

    expect(result.current.isSyncing).toBe(false);
    expect(PlayerService.syncUsageWithApi).toHaveBeenCalled();
  });

  test('Deve aggiornare i dati locali periodicamente dopo la sync iniziale', async () => {
    const { result } = renderHook(() => useApiUsageViewModel(1000));
    
    await waitFor(() => expect(result.current.isSyncing).toBe(false));
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    // getApiUsage chiamato dagli intervalli periodici
    expect(PlayerService.getApiUsage).toHaveBeenCalled();
  });

  test('resetCounter deve chiamare il service e aggiornare lo stato', async () => {
    const { result } = renderHook(() => useApiUsageViewModel());
    await waitFor(() => expect(result.current.isSyncing).toBe(false));

    act(() => {
      result.current.resetCounter();
    });

    expect(PlayerService.resetApiCounter).toHaveBeenCalled();
    expect(PlayerService.getApiUsage).toHaveBeenCalled();
  });

  test('clearCache deve rimuovere solo le chiavi pertinenti', async () => {
    localStorage.setItem('players_1', 'data');
    localStorage.setItem('other_key', 'keep me');

    const { result } = renderHook(() => useApiUsageViewModel());
    await waitFor(() => expect(result.current.isSyncing).toBe(false));
    
    let deletedCount;
    act(() => {
      deletedCount = result.current.clearCache();
    });

    expect(deletedCount).toBe(1);
    expect(localStorage.getItem('players_1')).toBeNull();
    expect(localStorage.getItem('other_key')).toBe('keep me');
  });
});