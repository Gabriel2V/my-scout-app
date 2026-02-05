/** 
 * @file useApiUsageViewModel.test.js
 * @description Test per il monitoraggio dei consumi API, verificando il corretto aggiornamento dei contatori e le funzioni di reset.
 */
import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useApiUsageViewModel } from '../useApiUsageViewModel';
import PlayerService from '../../services/PlayerService';

vi.mock('../../services/PlayerService', () => ({
  default: {
    getApiUsage: vi.fn(),
    getApiConfig: vi.fn(() => ({ baseUrl: 'https://api.test', isConfigured: true })),
    resetApiCounter: vi.fn()
  }
}));

describe('useApiUsageViewModel', () => {
  const mockUsage = { used: 10, limit: 100, percentage: 10 };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    PlayerService.getApiUsage.mockReturnValue(mockUsage);
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('Deve inizializzare lo stato con i dati del service', () => {
    const { result } = renderHook(() => useApiUsageViewModel());
    expect(result.current.usage).toEqual(mockUsage);
    expect(PlayerService.getApiUsage).toHaveBeenCalledTimes(1);
  });

  test('Deve aggiornare i dati periodicamente', () => {
    renderHook(() => useApiUsageViewModel(1000));
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    // 1 chiamata iniziale + 3 intervalli
    expect(PlayerService.getApiUsage).toHaveBeenCalledTimes(4);
  });

  test('resetCounter deve chiamare il service e aggiornare lo stato', () => {
    const { result } = renderHook(() => useApiUsageViewModel());
    
    act(() => {
      result.current.resetCounter();
    });

    expect(PlayerService.resetApiCounter).toHaveBeenCalled();
    expect(PlayerService.getApiUsage).toHaveBeenCalledTimes(2); // Init + dopo reset
  });

  test('clearCache deve rimuovere solo le chiavi pertinenti', () => {
    localStorage.setItem('players_1', 'data');
    localStorage.setItem('players_2', 'data');
    localStorage.setItem('other_key', 'keep me');

    const { result } = renderHook(() => useApiUsageViewModel());
    
    let deletedCount;
    act(() => {
      deletedCount = result.current.clearCache();
    });

    expect(deletedCount).toBe(2);
    expect(localStorage.getItem('players_1')).toBeNull();
    expect(localStorage.getItem('other_key')).toBe('keep me');
  });
});