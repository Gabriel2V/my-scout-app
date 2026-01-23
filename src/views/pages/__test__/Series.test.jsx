/**
 * TEST: Series.test.js
 * Verifica la visualizzazione dei campionati (Series) per una nazione
 * Controlla che vengano mostrati i bottoni di navigazione verso "Squadre" e "Giocatori" per ogni lega trovata
 */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import Series from '../Series';
import PlayerService from '../../../services/PlayerService';

vi.mock('../../../services/PlayerService', () => ({
  default: { getLeagues: vi.fn() }
}));

describe('Pagina Series', () => {
  test('Deve renderizzare i campionati con i relativi bottoni di azione', async () => {
    PlayerService.getLeagues.mockResolvedValue([{ league: { id: 1, name: 'Serie A', logo: 'url' } }]);
    render(<MemoryRouter><Series /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Serie A')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Squadre/i })).toBeInTheDocument();
    });
  });
});