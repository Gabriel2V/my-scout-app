/**
 * TEST: Series.test.js
 * Descrizione: Verifica il caricamento dei campionati per nazione.
 */
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import Series from '../Series';
import PlayerService from '../../../services/PlayerService';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ nazioneId: 'Italy' }),
  useNavigate: () => jest.fn(),
}), { virtual: true });

jest.mock('../../../services/PlayerService');

describe('Pagina Series', () => {
  test('Deve renderizzare i campionati con i relativi bottoni di azione', async () => {
    const mockLeagues = [
      { league: { id: 1, name: 'Serie A', logo: 'url_logo' } }
    ];
    
    PlayerService.getLeagues.mockResolvedValue(mockLeagues);

    render(<Series />);

    // Aspettiamo che il caricamento finisca e che compaiano titolo e dati
    await waitFor(() => {
      expect(screen.getByText(/Campionati in Italy/i)).toBeInTheDocument();
      expect(screen.getByText('Serie A')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Squadre/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Giocatori/i })).toBeInTheDocument();
    });
  });
});