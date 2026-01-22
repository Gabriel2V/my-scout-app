/**
 * TEST: Players Page
 * Verifica l'applicazione corretta dei filtri (Rating, Ruolo) sulla lista giocatori
 */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import Players from '../Players';
import { usePlayersViewModel } from '../../../viewmodels/usePlayersViewModel';

jest.mock('react-router-dom', () => ({ 
  useOutletContext: () => ({ searchTerm: '' }),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/giocatori' })
}), { virtual: true });

jest.mock('../../../viewmodels/usePlayersViewModel');

describe('Players Page', () => {
  test('Deve applicare il filtro rating tramite lo slider', () => {
    usePlayersViewModel.mockReturnValue({ players: [], loading: false });
    render(<Players />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '8' } });
    expect(screen.getByText(/Rating Minimo: 8/i)).toBeInTheDocument();
  });
});