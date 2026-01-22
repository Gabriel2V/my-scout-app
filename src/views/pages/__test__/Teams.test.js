/**
 * TEST: Teams.test.js
 * Verifica la pagina delle Squadre di un campionato
 * Testa il caricamento dei dati, la gestione dello stato di loading e la visualizzazione del messaggio in caso di lista vuota
 */
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import Teams from '../Teams';
import PlayerService from '../../../services/PlayerService';
jest.mock('react-router-dom', () => ({
  useParams: () => ({ serieId: '135' }),
  useNavigate: () => jest.fn()
}), { virtual: true });

jest.mock('../../../services/PlayerService');

describe('Pagina Teams', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('Deve mostrare lo stato di caricamento e poi l\'elenco delle squadre', async () => {
    const mockTeams = [
      { team: { id: 1, name: 'Inter', logo: 'url_inter' } }
    ];
    
    PlayerService.getTeams.mockResolvedValue(mockTeams);

    render(<Teams />);

    // Controllo stato iniziale
    expect(screen.getByText(/Caricamento squadre/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Inter')).toBeInTheDocument();
      expect(screen.getByText('Squadre del Campionato')).toBeInTheDocument();
    });
  });

  test('Deve mostrare un messaggio se non vengono trovate squadre', async () => {
    PlayerService.getTeams.mockResolvedValue([]);

    render(<Teams />);

    await waitFor(() => {
      expect(screen.getByText(/Nessuna squadra trovata/i)).toBeInTheDocument();
    });
  });
});