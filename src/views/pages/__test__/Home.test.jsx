/**
 * TEST: HomePage
 * Verifica il rendering correttodella dashboard iniziale e dei link di navigazione
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import Home from '../Home';

describe('Home Page', () => {
  test('Deve mostrare le opzioni principali Nazioni e Giocatori', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(screen.getByText('Nazioni')).toBeInTheDocument();
    expect(screen.getByText('Giocatori Mondiali')).toBeInTheDocument();
  });
});