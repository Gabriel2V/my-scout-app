/**
 * TEST: SearchResults Page
 * Verifica il rendering delle diverse sezioni di risultati e la gestione degli stati vuoti o di caricamento
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import SearchResults from '../SearchResults';
import { useSearchViewModel } from '../../../viewmodels/useSearchViewModel';

vi.mock('../../../viewmodels/useSearchViewModel');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { 
    ...actual, 
    useSearchParams: () => [new URLSearchParams('q=Milan')],
    useOutletContext: () => ({ setSearchTerm: vi.fn() })
  };
});

describe('SearchResults Page', () => {
  test('Deve mostrare i risultati per squadre quando presenti', () => {
    vi.mocked(useSearchViewModel).mockReturnValue({
      players: [],
      teams: [{ id: 1, name: 'AC Milan', logo: 'url', country: 'Italy' }],
      nations: [],
      loading: false
    });

    render(<MemoryRouter><SearchResults /></MemoryRouter>);
    expect(screen.getByText(/Risultati per "Milan"/i)).toBeInTheDocument();
    expect(screen.getByText('AC Milan')).toBeInTheDocument();
  });
});