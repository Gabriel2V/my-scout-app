/** 
 * @file useTeamsViewModel.test.js 
 * @description Test per il recupero della lista squadre di un campionato e gestione della cache specifica. 
*/
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import { useTeamsViewModel } from '../useTeamsViewModel';
import PlayerService from '../../services/PlayerService';

vi.mock('../../services/PlayerService', () => ({
  default: { getTeams: vi.fn() }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ serieId: '135' }) };
});

describe('useTeamsViewModel', () => {
  test('Deve gestire lo stato di caricamento e i dati', async () => {
    const mockTeams = [{ team: { name: 'Milan' } }];
    PlayerService.getTeams.mockResolvedValue(mockTeams);

    const { result } = renderHook(() => useTeamsViewModel(), { wrapper: MemoryRouter });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.teams).toEqual(mockTeams);
  });
});