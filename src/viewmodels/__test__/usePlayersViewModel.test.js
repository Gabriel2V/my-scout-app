/**
 * TEST: usePlayersViewModel
 * Verifica la logica di stato, il recupero dati condizionale e l'integrazione con il service
 */
import { renderHook, waitFor } from '@testing-library/react';
import { usePlayersViewModel } from '../usePlayersViewModel';
import PlayerService from '../../services/PlayerService';

// Mock virtuale con implementazione di default sicura
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(() => ({})), // Inizializzato a {} invece di undefined
  useNavigate: () => jest.fn(),
}), { virtual: true });

// Importa useParams dal mock per poterlo manipolare nei test
import { useParams } from 'react-router-dom';

jest.mock('../../services/PlayerService');

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('usePlayersViewModel Hook', () => {
  const mockPlayerData = [
    { 
      player: { id: 1, name: 'Barella', photo: 'url' }, 
      statistics: [{ team: { name: 'Inter' }, games: { rating: '7.5' }, goals: { total: 2 } }] 
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    useParams.mockReturnValue({}); // Reset a oggetto vuoto
    PlayerService.getPlayersByLeague.mockResolvedValue(mockPlayerData);
  });

  test('Deve inizializzare correttamente lo stato', async () => {
    const { result } = renderHook(() => usePlayersViewModel());
    
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  test('Deve caricare dati dalla cache se disponibili', async () => {
    useParams.mockReturnValue({ serieId: '135' });
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockPlayerData));

    const { result } = renderHook(() => usePlayersViewModel());

    await waitFor(() => {
      expect(result.current.players[0].name).toBe('Barella');
    });
  });
});