/**
 * TEST: usePlayersViewModel
 * Verifica la logica di stato, il recupero dati condizionale e l'integrazione con il service
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { usePlayersViewModel } from '../usePlayersViewModel';
import PlayerService from '../../services/PlayerService';
import { useParams } from 'react-router-dom';

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
  useNavigate: () => vi.fn(),
}));

vi.mock('../../services/PlayerService', () => ({
  default: {
    getPlayersByLeague: vi.fn(),
    getPlayersByTeam: vi.fn(),
    getTopPlayersBatch: vi.fn(),
    getApiUsage: vi.fn(() => ({ used: 0, limit: 100 }))
  }
}));

describe('usePlayersViewModel Hook', () => {
  const mockPlayerData = [{ 
    player: { id: 1, name: 'Barella' }, 
    statistics: [{ team: { name: 'Inter' }, games: { rating: '7.5' } }] 
  }];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useParams.mockReturnValue({});
    PlayerService.getPlayersByLeague.mockResolvedValue(mockPlayerData);
  });

  test('Deve inizializzare correttamente lo stato', async () => {
    const { result } = renderHook(() => usePlayersViewModel());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  test('Deve caricare dati dalla cache se disponibili', async () => {
    useParams.mockReturnValue({ serieId: '135' });
    const cacheKey = 'players_league_135_page_1';
    localStorage.setItem(cacheKey, JSON.stringify(mockPlayerData));

    const { result } = renderHook(() => usePlayersViewModel());
    await waitFor(() => {
      expect(result.current.players[0].name).toBe('Barella');
    });
  });
});