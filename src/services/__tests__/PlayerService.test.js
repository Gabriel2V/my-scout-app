/**
 * TEST: PlayerService.test.js
 * Descrizione: Verifica le chiamate asincrone verso l'API esterna.
 * Utilizza il mocking di fetch per simulare le risposte del server e testare la gestione degli errori.
 */
import PlayerService from '../PlayerService';

// Mock della funzione fetch globale
global.fetch = jest.fn();

describe('PlayerService API Calls', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('getCountries deve restituire una lista di nazioni in caso di successo', async () => {
    const mockResponse = { response: [{ name: 'Italy', code: 'IT' }] };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await PlayerService.getCountries();
    
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/countries'), expect.any(Object));
    expect(result).toEqual(mockResponse.response);
  });

  test('Deve lanciare un errore se la risposta HTTP non è ok', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
    });

    await expect(PlayerService.getCountries()).rejects.toThrow('Errore HTTP: 403');
  });
});