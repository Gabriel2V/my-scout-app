/** 
 * @file useSeriesViewModel.test.js 
 * @description Test per la gestione dei campionati filtrati per nazione e relativi stati di caricamento. 
*/
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useSeriesViewModel } from '../useSeries.ViewModel';
import PlayerService from '../../services/PlayerService';

vi.mock('../../services/PlayerService', () => ({
  default: { getLeagues: vi.fn() }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ nazioneId: 'Italy' }) };
});

describe('useSeriesViewModel', () => {
  test('Deve caricare le serie di una nazione', async () => {
    const mockData = [{ league: { name: 'Serie A' } }];
    PlayerService.getLeagues.mockResolvedValue(mockData);

    const { result } = renderHook(() => useSeriesViewModel(), { wrapper: MemoryRouter });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.leagues).toEqual(mockData);
  });
});