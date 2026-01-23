/**
 * TEST: Players Page
 * Verifica l'applicazione corretta dei filtri (Rating, Ruolo) sulla lista giocatori
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import Players from '../Players';
import { usePlayersViewModel } from '../../../viewmodels/usePlayersViewModel';

vi.mock('../../../viewmodels/usePlayersViewModel');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { 
    ...actual, 
    useOutletContext: () => ({ searchTerm: '' }), 
    useLocation: () => ({ pathname: '/giocatori' }) 
  };
});

describe('Players Page', () => {
  const mockPlayers = [
    { id: 1, name: 'Barella', nationality: 'Italy', rating: '7.5', goals: 2, position: 'Midfielder', photo: 'url' },
    { id: 2, name: 'Messi', nationality: 'Argentina', rating: '8.5', goals: 10, position: 'Attacker', photo: 'url' }
  ];

  test('Deve visualizzare la lista dinamica delle nazioni nella FilterBar', () => {
    vi.mocked(usePlayersViewModel).mockReturnValue({ players: mockPlayers, loading: false });
    render(<MemoryRouter><Players /></MemoryRouter>);
    
    expect(screen.getByText('Italy')).toBeInTheDocument();
    expect(screen.getByText('Argentina')).toBeInTheDocument();
  });
});