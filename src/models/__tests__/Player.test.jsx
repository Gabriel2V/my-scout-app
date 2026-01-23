/**
 * TEST: Player.test.js
 * Descrizione: Verifica la corretta instanziazione del modello Player e la logica di business associata
 * Questo file testa che i dati grezzi dell'API siano mappati correttamente e che le funzioni di calcolo operino come previsto
 */
import { describe, test, expect } from 'vitest';
import { Player } from '../Player';

describe('Classe Player Model', () => {
  const mockApiData = {
    player: { id: 1, name: 'Lionel Messi', photo: 'url_photo', nationality: 'Argentina', age: 36 },
    statistics: [{ team: { name: 'Inter Miami' }, games: { rating: '8.5' }, goals: { total: 10 } }]
  };

  test('Deve creare correttamente un oggetto Player dai dati API', () => {
    const player = new Player(mockApiData);
    expect(player.id).toBe(1);
    expect(player.name).toBe('Lionel Messi');
    expect(player.team).toBe('Inter Miami');
    expect(player.rating).toBe('8.5');
    expect(player.goals).toBe(10);
  });

  test('isTopPlayer deve restituire true se il rating è superiore a 7.5', () => {
    const topPlayer = new Player(mockApiData);
    expect(topPlayer.isTopPlayer()).toBe(true);
  });

  test('isTopPlayer deve restituire false se il rating è inferiore o uguale a 7.5', () => {
    const averagePlayerData = {
      ...mockApiData,
      statistics: [{ ...mockApiData.statistics[0], games: { rating: '7.0' } }]
    };
    const player = new Player(averagePlayerData);
    expect(player.isTopPlayer()).toBe(false);
  });
});