/**
 * TEST: useNationsViewModel
 * Verifica il recupero della lista nazioni e il salvataggio in cache.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useNationsViewModel } from '../useNationsViewModel';
import PlayerService from '../../services/PlayerService';

vi.mock('../../services/PlayerService', () => ({
  default: { getCountries: vi.fn() }
}));

describe('useNationsViewModel', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

  test('Deve caricare e salvare le nazioni in cache', async () => {
    const mockData = [{ name: 'Italy', flag: 'url' }];
    PlayerService.getCountries.mockResolvedValue(mockData);

    const { result } = renderHook(() => useNationsViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    expect(result.current.nations).toEqual(mockData);
    expect(localStorage.getItem('cache_nations')).toBeTruthy();
  });
});