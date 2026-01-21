/**
 * TEST: Players.test.js
 * Descrizione: Verifica il filtraggio per rating nella pagina dei giocatori.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import Players from '../Players';
import { usePlayersViewModel } from '../../../viewmodels/usePlayersViewModel';

// CORREZIONE: Aggiunto useNavigate al mock
jest.mock('react-router-dom', () => ({ 
  useOutletContext: () => ({ searchTerm: '' }),
  useNavigate: () => jest.fn() 
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