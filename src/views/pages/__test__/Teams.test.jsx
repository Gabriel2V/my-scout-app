/**
 * TEST: Teams.test.js
 * Verifica la pagina delle Squadre di un campionato
 * Testa il caricamento dei dati, la gestione dello stato di loading e la visualizzazione del messaggio in caso di lista vuota
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
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });

  test("Deve mostrare lo stato di caricamento e poi l'elenco delle squadre", async () => {
    PlayerService.getTeams.mockResolvedValue([{ team: { id: 1, name: 'Inter', logo: 'url' } }]);
    render(<MemoryRouter><Teams /></MemoryRouter>);
    expect(screen.getByText(/Caricamento squadre/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Inter')).toBeInTheDocument());
  });

  test('Deve mostrare un messaggio se non vengono trovate squadre', async () => {
    PlayerService.getTeams.mockResolvedValue([]);
    render(<MemoryRouter><Teams /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Nessuna squadra trovata/i)).toBeInTheDocument());
  });
});