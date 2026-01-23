/**
 * TEST: Series.test.js
 * Verifica la visualizzazione dei campionati (Series) per una nazione
 * Controlla che vengano mostrati i bottoni di navigazione verso "Squadre" e "Giocatori" per ogni lega trovata
 */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import Series from '../Series';
import PlayerService from '../../../services/PlayerService';

vi.mock('../../../services/PlayerService', () => ({
  default: { getLeagues: vi.fn() }
}));

describe('Series Page', () => {
  test('Deve renderizzare i campionati con i relativi bottoni di azione', async () => {
    const mockLeagues = [{ league: { id: 1, name: 'Serie A', logo: 'url' } }];
    vi.mocked(PlayerService.getLeagues).mockResolvedValue(mockLeagues);

    render(
      <MemoryRouter initialEntries={['/nazioni/Italy']}>
        <Routes>
          <Route path="/nazioni/:nazioneId" element={<Series />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Serie A')).toBeInTheDocument());
    expect(screen.getByText(/🛡️ Squadre/i)).toBeInTheDocument();
    expect(screen.getByText(/⚽ Giocatori/i)).toBeInTheDocument();
  });
});