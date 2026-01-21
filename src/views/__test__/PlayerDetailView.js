import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import PlayerDetailView from '../PlayerDetailView';
import PlayerService from '../../services/PlayerService';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useLocation: () => ({ state: null }),
  useNavigate: () => jest.fn(),
}), { virtual: true });

jest.mock('../../services/PlayerService');

describe('PlayerDetailView', () => {
  test('Deve mostrare lo stato di caricamento all\'inizio', () => {
    render(<PlayerDetailView />);
    expect(screen.getByText(/Caricamento dettagli/i)).toBeInTheDocument();
  });

  test('Deve mostrare i dati del giocatore dopo il fetch', async () => {
    PlayerService.getPlayerById.mockResolvedValue([{
      player: { id: 1, name: 'Lionel Messi', photo: 'url', nationality: 'ARG', age: 36 },
      statistics: [{ team: { name: 'Inter Miami' }, games: { rating: '8.5' }, goals: { total: 10 } }]
    }]);

    render(<PlayerDetailView />);
    await waitFor(() => expect(screen.getByText('Lionel Messi')).toBeInTheDocument());
    expect(screen.getByText('Inter Miami')).toBeInTheDocument();
  });
});