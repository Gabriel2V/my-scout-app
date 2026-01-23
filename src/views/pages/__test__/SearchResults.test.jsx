/**
 * TEST: SearchResults Page
 * Verifica il rendering delle diverse sezioni di risultati e la gestione degli stati vuoti o di caricamento
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import SearchResults from '../SearchResults';
import { useSearchViewModel } from '../../../viewmodels/useSearchViewModel';

const mockNavigate = vi.fn();
let mockSearchTerm = 'Inter';

// Mock di react-router-dom con gestione dinamica del contesto
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: () => ({ searchTerm: mockSearchTerm }),
    useNavigate: () => mockNavigate,
  };
});

// Mock del ViewModel con percorso corretto
vi.mock('../../../viewmodels/useSearchViewModel');

// Mock dei componenti figli per isolare il test della pagina
vi.mock('../../components/GenericCard', () => ({
  default: ({ title, onClick }) => (
    <div data-testid="generic-card" onClick={onClick}>{title}</div>
  )
}));

vi.mock('../../PlayerCard', () => ({
  PlayerCard: ({ player }) => <div data-testid="player-card">{player.name}</div>
}));

describe('SearchResults Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchTerm = 'Inter';
  });

  test('Deve mostrare lo stato di caricamento quando loading è true', () => {
    vi.mocked(useSearchViewModel).mockReturnValue({ players: [], teams: [], nations: [], loading: true });
    render(<MemoryRouter><SearchResults /></MemoryRouter>);
    expect(screen.getByText(/Ricerca in corso/i)).toBeInTheDocument();
  });

  test('Deve chiedere più caratteri se il termine di ricerca è troppo breve', () => {
    mockSearchTerm = 'It';
    vi.mocked(useSearchViewModel).mockReturnValue({ players: [], teams: [], nations: [], loading: false });
    render(<MemoryRouter><SearchResults /></MemoryRouter>);
    expect(screen.getByText(/Inserisci almeno 3 caratteri/i)).toBeInTheDocument();
  });

  test('Deve mostrare "Nessun risultato trovato" se tutte le liste sono vuote', () => {
    vi.mocked(useSearchViewModel).mockReturnValue({ players: [], teams: [], nations: [], loading: false });
    render(<MemoryRouter><SearchResults /></MemoryRouter>);
    expect(screen.getByText(/Nessun risultato trovato/i)).toBeInTheDocument();
  });

  test('Deve visualizzare correttamente le sezioni Nazioni, Squadre e Giocatori', () => {
    vi.mocked(useSearchViewModel).mockReturnValue({ 
      nations: [{ name: 'Italy', flag: 'url' }], 
      teams: [{ id: 1, name: 'Inter' }], 
      players: [{ id: 10, name: 'Barella' }], 
      loading: false 
    });
    render(<MemoryRouter><SearchResults /></MemoryRouter>);
    expect(screen.getByText(/Nazioni \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Squadre & Nazionali \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Giocatori \(1\)/i)).toBeInTheDocument();
  });

  test('Deve navigare alla pagina corretta cliccando su una Nazione', () => {
    vi.mocked(useSearchViewModel).mockReturnValue({ nations: [{ name: 'France', flag: 'url' }], teams: [], players: [], loading: false });
    render(<MemoryRouter><SearchResults /></MemoryRouter>);
    fireEvent.click(screen.getByText('France'));
    expect(mockNavigate).toHaveBeenCalledWith('/nazioni/France');
  });

  test('Deve navigare alla pagina corretta cliccando su una Squadra', () => {
    vi.mocked(useSearchViewModel).mockReturnValue({ nations: [], teams: [{ id: 99, name: 'Juve' }], players: [], loading: false });
    render(<MemoryRouter><SearchResults /></MemoryRouter>);
    fireEvent.click(screen.getByText('Juve'));
    expect(mockNavigate).toHaveBeenCalledWith('/squadre/99/giocatori');
  });
});