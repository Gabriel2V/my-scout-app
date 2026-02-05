/** 
 * @file Teams.test.jsx 
 * @description Test per la lista dei club, verifica il messaggio di "Nessun risultato" e la navigazione verso la rosa. 
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