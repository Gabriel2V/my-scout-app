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
  test('Deve mostrare le opzioni principali della Dashboard', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(screen.getByText(/Leghe per Nazione/i)).toBeInTheDocument();
    expect(screen.getByText(/Squadre Nazionali/i)).toBeInTheDocument();
    expect(screen.getByText(/Top Player Mondiali/i)).toBeInTheDocument();
  });
});