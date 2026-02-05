/**
 * @file useNationalTeamsViewModel.test.js
 * @description Verifica il caricamento parallelo delle nazionali e la deduplicazione.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useNationalTeamsViewModel } from '../useNationalTeamsViewModel';
import PlayerService from '../../services/PlayerService';

vi.mock('../../services/PlayerService', () => ({
  default: { searchTeams: vi.fn() }
}));

describe('useNationalTeamsViewModel', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('Deve aggregare i risultati e filtrare solo le nazionali', async () => {
    // Simuliamo che la ricerca restituisca un club e una nazionale
    PlayerService.searchTeams.mockResolvedValue([
      { team: { id: 1, name: 'Italy', national: true, logo: 'flag.png' } },
      { team: { id: 2, name: 'Juventus', national: false, logo: 'club.png' } } // Da scartare
    ]);

    const { result } = renderHook(() => useNationalTeamsViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Deve contenere solo Italy
    expect(result.current.teams).toHaveLength(1);
    expect(result.current.teams[0].name).toBe('Italy');
    
    // Verifica che abbia chiamato il servizio più volte (per le 8 nazioni hardcoded)
    expect(PlayerService.searchTeams).toHaveBeenCalledTimes(8);
  });
});