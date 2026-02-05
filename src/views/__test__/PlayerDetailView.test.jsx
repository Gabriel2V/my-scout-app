/** 
 * @file PlayerDetailView.test.jsx 
 * @description Test per la vista di dettaglio, verifica il caricamento dei dati approfonditi e la navigazione tra giocatori. 
 */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import React from 'react';
import PlayerDetailView from '../PlayerDetailView';
import PlayerService from '../../services/PlayerService';

vi.mock('../../services/PlayerService', () => ({
  default: { getPlayerById: vi.fn(), getApiUsage: vi.fn() }
}));

describe('PlayerDetailView', () => {
  test("Deve mostrare lo stato di caricamento all'inizio", async () => {
    render(<MemoryRouter initialEntries={['/giocatori/1']}><PlayerDetailView /></MemoryRouter>);
    // Usiamo findByText che gestisce implicitamente l'attesa asincrona
    expect(await screen.findByText(/Caricamento dettagli/i)).toBeInTheDocument();
  });

test('Deve mostrare i dati del giocatore dopo il fetch', async () => {
    PlayerService.getPlayerById.mockResolvedValue([{
      player: { id: 1, name: 'Lionel Messi', photo: 'url' },
      statistics: [{ team: { name: 'Inter Miami' }, games: { rating: '8.5' } }]
    }]);

    render(
      <MemoryRouter initialEntries={['/giocatori/1']}>
        <Routes><Route path="/giocatori/:id" element={<PlayerDetailView />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Lionel Messi')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText(/Caricamento dettagli/i)).not.toBeInTheDocument());

    expect(screen.getByText('Inter Miami')).toBeInTheDocument();
  });
});