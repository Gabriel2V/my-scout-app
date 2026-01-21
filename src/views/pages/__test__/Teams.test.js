/**
 * TEST: Teams.test.js
 * Descrizione: Verifica la visualizzazione delle squadre per una serie.
 */
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import Teams from '../Teams';
import PlayerService from '../../../services/PlayerService';

// Mock virtuale per risolvere l'errore del modulo mancante
jest.mock('react-router-dom', () => ({
  useParams: () => ({ serieId: '135' }),
  useNavigate: () => jest.fn()
}), { virtual: true });

jest.mock('../../../services/PlayerService');

describe('Pagina Teams', () => {
  // CORREZIONE: Pulizia profonda prima di ogni singolo test
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear(); // Rimuove la cache che bloccava il test dell'errore
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
    // Ora che localStorage è pulito, il componente chiamerà l'API mockata qui
    PlayerService.getTeams.mockResolvedValue([]);

    render(<Teams />);

    await waitFor(() => {
      // Verifichiamo che compaia il messaggio corretto invece dei vecchi dati
      expect(screen.getByText(/Nessuna squadra trovata/i)).toBeInTheDocument();
    });
  });
});