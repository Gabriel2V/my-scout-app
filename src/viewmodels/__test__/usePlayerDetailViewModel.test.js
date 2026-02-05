/**
 * @file usePlayerDetailViewModel.test.js
 * @description Test unitario per la logica di dettaglio giocatore.
 * Verifica la priorità dei dati passati via state (Zero-Network) rispetto al fetch remoto.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { usePlayerDetailViewModel } from '../usePlayerDetailViewModel';
import PlayerService from '../../services/PlayerService';

// Mock del servizio
vi.mock('../../services/PlayerService', () => ({
  default: { getPlayerById: vi.fn() }
}));

describe('usePlayerDetailViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Deve usare i dati passati nello stato (initialPlayer) senza chiamare l\'API', async () => {
    const mockInitialPlayer = { id: 10, name: 'Del Piero', rating: '9.0' };
    
    // Passiamo l'oggetto player come farebbe il Router
    const { result } = renderHook(() => 
      usePlayerDetailViewModel('10', mockInitialPlayer, [])
    );

    // Non deve essere in loading
    expect(result.current.loading).toBe(false);
    // Deve avere i dati
    expect(result.current.player.name).toBe('Del Piero');
    // NON deve aver chiamato il servizio (Zero-Network)
    expect(PlayerService.getPlayerById).not.toHaveBeenCalled();
  });

  test('Deve chiamare l\'API se initialPlayer è assente (Accesso diretto URL)', async () => {
    const mockApiData = [{ player: { id: 20, name: 'Totti' }, statistics: [] }];
    PlayerService.getPlayerById.mockResolvedValue(mockApiData);

    const { result } = renderHook(() => 
      usePlayerDetailViewModel('20', null, [])
    );

    // Inizialmente loading true
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.player.name).toBe('Totti');
    expect(PlayerService.getPlayerById).toHaveBeenCalledWith('20');
  });

  test('Deve calcolare correttamente Prev e Next player dalla contextList', () => {
    const contextList = [
      { id: 1, name: 'Buffon' },
      { id: 2, name: 'Cannavaro' }, // Player corrente
      { id: 3, name: 'Pirlo' }
    ];
    const initialPlayer = { id: 2, name: 'Cannavaro' };

    const { result } = renderHook(() => 
      usePlayerDetailViewModel('2', initialPlayer, contextList)
    );

    expect(result.current.prevPlayer.name).toBe('Buffon');
    expect(result.current.nextPlayer.name).toBe('Pirlo');
  });
});