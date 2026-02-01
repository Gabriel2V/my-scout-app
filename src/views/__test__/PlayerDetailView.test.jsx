/**
 * TEST: PlayerDetailView.js
 * Suite di test per la pagina di dettaglio del giocatore
 * Verifica che lo stato di caricamento iniziale appaia e che, una volta ricevuti i dati dal mock del service, vengano mostrate le informazioni corrette (nome, squadra, statistiche)
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