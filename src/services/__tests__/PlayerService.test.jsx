/** * @file PlayerService.test.jsx 
 * @description Test per il layer di comunicazione, verifica il mocking delle fetch, gli endpoint generati e la gestione del daily limit. 
 */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import PlayerService from '../PlayerService';

global.fetch = vi.fn();

describe('PlayerService API Calls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
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

  test('syncUsageWithApi deve aggiornare il contatore locale con i dati del server', async () => {
    const mockStatusResponse = {
      response: {
        requests: { current: 45, limit_day: 100 }
      }
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatusResponse,
    });

    const usage = await PlayerService.syncUsageWithApi();
    expect(usage.used).toBe(45);
    const stored = JSON.parse(localStorage.getItem('api_counter'));
    expect(stored.count).toBe(45);
  });

  test('Deve lanciare un errore se la risposta HTTP non è ok', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 403 });
    await expect(PlayerService.getCountries()).rejects.toThrow('Errore HTTP: 403');
  });
  test('syncUsageWithApi NON deve aggiornare se il server riporta un valore inferiore al locale', async () => {
    // Setup: locale a 50
    localStorage.setItem('api_counter', JSON.stringify({ count: 50, date: new Date().toDateString() }));
    
    // Mock server a 40 (ritardo API)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: { requests: { current: 40 } } }),
    });

    const usage = await PlayerService.syncUsageWithApi();
    
    // Deve restare 50
    expect(usage.used).toBe(50);
    expect(JSON.parse(localStorage.getItem('api_counter')).count).toBe(50);
  });
});