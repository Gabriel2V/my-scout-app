/**
 * TEST: Home.test.js
 * Descrizione: Verifica la presenza delle sezioni principali nella Home.
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import Home from '../Home';

jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true });

describe('Home Page', () => {
  test('Deve mostrare le opzioni principali Nazioni e Giocatori', () => {
    render(<Home />);
    expect(screen.getByText('Nazioni')).toBeInTheDocument();
    expect(screen.getByText('Giocatori Mondiali')).toBeInTheDocument();
  });
});