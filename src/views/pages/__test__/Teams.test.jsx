/**
 * TEST: Teams Page
 * Integration test per la pagina Squadre.
 * Verifica il caricamento, la gestione della cache e il rendering della griglia o del messaggio di errore.
 */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import Teams from '../Teams';
import PlayerService from '../../../services/PlayerService';

vi.mock('../../../services/PlayerService', () => ({
  default: { getTeams: vi.fn() }
}));

describe('Pagina Teams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear(); // FIX: Pulisce la cache per evitare che i dati del test precedente influenzino quello attuale
  });

  test("Deve mostrare lo stato di caricamento e poi l'elenco delle squadre", async () => {
    const mockTeams = [{ team: { id: 1, name: 'AC Milan', logo: 'url' } }];
    PlayerService.getTeams.mockResolvedValue(mockTeams);

    render(<MemoryRouter><Teams /></MemoryRouter>);
    expect(screen.getByText(/Caricamento squadre/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('AC Milan')).toBeInTheDocument());
  });

  test('Deve mostrare un messaggio se non vengono trovate squadre', async () => {
    PlayerService.getTeams.mockResolvedValue([]);
    render(<MemoryRouter><Teams /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Nessuna squadra trovata/i)).toBeInTheDocument());
  });
});