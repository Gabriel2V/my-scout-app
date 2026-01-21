/**
 * TEST: useSearchViewModel.test.js
 * Descrizione: Suite di test completa per la logica di ricerca globale.
 * Copre:
 * 1. Debouncing (attesa input utente)
 * 2. Ricerca Nazioni (filtraggio locale)
 * 3. Ricerca Giocatori (Cache locale + API remota)
 * 4. Ricerca Squadre (API remota)
 */
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSearchViewModel } from '../useSearchViewModel';
import PlayerService from '../../services/PlayerService';

// Mock del servizio API
jest.mock('../../services/PlayerService');

// Mock robusto del LocalStorage per simulare la cache
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    key: (index) => Object.keys(store)[index] || null,
    get length() { return Object.keys(store).length; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useSearchViewModel Hook', () => {
  // Dati di mock
  const mockCountries = [
    { name: 'Italy', code: 'IT', flag: 'url_it' },
    { name: 'France', code: 'FR', flag: 'url_fr' },
    { name: 'Spain', code: 'ES', flag: 'url_es' }
  ];

  const mockCachedPlayers = [
    { 
      player: { id: 10, name: 'Alessandro Del Piero', photo: 'url' }, 
      statistics: [{ team: { name: 'Juventus', logo: 'url' }, games: { rating: '8.5', position: 'Attacker' }, goals: { total: 200 } }] 
    }
  ];

  beforeEach(() => {
    jest.useFakeTimers();
    localStorageMock.clear();
    jest.clearAllMocks();

    // Setup default delle risposte API
    PlayerService.getCountries.mockResolvedValue(mockCountries);
    PlayerService.searchPlayers.mockResolvedValue([]);
    PlayerService.searchTeams.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // --- TEST 1: Input e Debounce ---
  test('Non deve eseguire ricerche se il termine è inferiore a 3 caratteri', async () => {
    const { result } = renderHook(() => useSearchViewModel('It'));

    // Avanziamo il timer per superare il debounce
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.nations).toEqual([]);
    expect(result.current.players).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(PlayerService.getCountries).not.toHaveBeenCalled();
  });

  // --- TEST 2: Ricerca Nazioni ---
  test('Deve trovare e filtrare le nazioni correttamente', async () => {
    const { result } = renderHook(() => useSearchViewModel('Ita'));

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      // Deve trovare 'Italy' ma non 'France' o 'Spain'
      expect(result.current.nations.length).toBe(1);
      expect(result.current.nations[0].name).toBe('Italy');
    });
  });

  // --- TEST 3: Ricerca Giocatori (Cache + API) ---
  test('Deve unire i risultati della cache locale con quelli dell API', async () => {
    // 1. Setup Cache Locale
    localStorageMock.setItem('players_serieA', JSON.stringify(mockCachedPlayers));

    // 2. Setup Risposta API (nuovo giocatore non in cache)
    const mockApiPlayers = [{
      player: { id: 20, name: 'Alessandro Bastoni', photo: 'url' },
      statistics: [{ team: { name: 'Inter' }, games: { position: 'Defender', rating: '7.5' }, goals: { total: 2 } }]
    }];
    PlayerService.searchPlayers.mockResolvedValue(mockApiPlayers);

    // 3. Esecuzione hook con termine "Ale" (matcha sia Del Piero che Bastoni)
    const { result } = renderHook(() => useSearchViewModel('Ale'));

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      // Verifica presenza giocatore da Cache
      expect(result.current.players.some(p => p.name === 'Alessandro Del Piero')).toBe(true);
      // Verifica presenza giocatore da API
      expect(result.current.players.some(p => p.name === 'Alessandro Bastoni')).toBe(true);
      
      expect(result.current.players.length).toBe(2);
    });
  });

  // --- TEST 4: Ricerca Squadre ---
  test('Deve trovare le squadre tramite API', async () => {
    const mockTeams = [{
      team: { id: 100, name: 'Inter Miami', logo: 'logo_im', country: 'USA' }
    }];
    PlayerService.searchTeams.mockResolvedValue(mockTeams);

    const { result } = renderHook(() => useSearchViewModel('Inter'));

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.teams.length).toBe(1);
      expect(result.current.teams[0].name).toBe('Inter Miami');
    });
  });

  // --- TEST 5: Gestione Errori ---
  test('Deve gestire il fallimento delle API senza crashare', async () => {
    // Simuliamo un errore su getCountries e searchPlayers
    PlayerService.getCountries.mockRejectedValue(new Error('Network Error'));
    PlayerService.searchPlayers.mockRejectedValue(new Error('API Down'));

    const { result } = renderHook(() => useSearchViewModel('Test'));

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      // Gli array dovrebbero essere vuoti ma l'app non deve esplodere
      expect(result.current.nations).toEqual([]);
      expect(result.current.players).toEqual([]);
    });
  });
});