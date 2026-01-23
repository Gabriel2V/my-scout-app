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
  return { ...actual, useOutletContext: () => ({ searchTerm: '' }) };
});

describe('Players Page', () => {
  test('Deve applicare il filtro rating tramite lo slider', () => {
    vi.mocked(usePlayersViewModel).mockReturnValue({ players: [], loading: false });
    render(<MemoryRouter><Players /></MemoryRouter>);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '8' } });
    expect(screen.getByText(/Rating Minimo: 8/i)).toBeInTheDocument();
  });
});