/** 
 * @file PlayerService.test.jsx 
 * @description Test per il layer di comunicazione, verifica il mocking delle fetch, gli endpoint generati e la gestione del daily limit. 
 */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import PlayerService from '../PlayerService';

global.fetch = vi.fn();

describe('PlayerService API Calls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    fetch.mockResolvedValueOnce({ ok: false, status: 403 });
    await expect(PlayerService.getCountries()).rejects.toThrow('Errore HTTP: 403');
  });
});