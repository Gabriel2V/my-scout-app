/**
 * TEST: Series.test.js
 * Verifica la visualizzazione dei campionati (Series) per una nazione
 * Controlla che vengano mostrati i bottoni di navigazione verso "Squadre" e "Giocatori" per ogni lega trovata
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

    await waitFor(() => {
      expect(screen.getByText(/Campionati in Italy/i)).toBeInTheDocument();
      expect(screen.getByText('Serie A')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Squadre/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Giocatori/i })).toBeInTheDocument();
    });
  });
});