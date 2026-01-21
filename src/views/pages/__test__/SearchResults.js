/**
 * TEST: SearchResults.test.js
 * Descrizione: Verifica la corretta visualizzazione e interazione della pagina dei risultati di ricerca.
 * Copre: stati di caricamento, input non valido, risultati vuoti, rendering delle sezioni e navigazione.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import SearchResults from '../SearchResults';
import { useSearchViewModel } from '../../viewmodels/useSearchViewModel';

// 1. Mock di react-router-dom
const mockNavigate = jest.fn();
// Definiamo una variabile per simulare il contesto (searchTerm)
let mockSearchTerm = 'Inter';

jest.mock('react-router-dom', () => ({
  useOutletContext: () => ({ searchTerm: mockSearchTerm }),
  useNavigate: () => mockNavigate,
}), { virtual: true });

// 2. Mock del ViewModel
jest.mock('../../viewmodels/useSearchViewModel');

// 3. Mock dei componenti figli per semplificare il test
jest.mock('../components/GenericCard', () => ({
  __esModule: true,
  default: ({ title, onClick }) => (
    <div data-testid="generic-card" onClick={onClick}>
      {title}
    </div>
  )
}));

jest.mock('../PlayerCard', () => ({
  PlayerCard: ({ player }) => <div data-testid="player-card">{player.name}</div>
}));

describe('SearchResults Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchTerm = 'Inter'; // Reset del termine di ricerca
  });

  test('Deve mostrare lo stato di caricamento quando loading è true', () => {
    useSearchViewModel.mockReturnValue({ 
      players: [], teams: [], nations: [], loading: true 
    });

    render(<SearchResults />);
    expect(screen.getByText(/Ricerca in corso/i)).toBeInTheDocument();
  });

  test('Deve chiedere più caratteri se il termine di ricerca è troppo breve', () => {
    mockSearchTerm = 'It'; // Termine < 3 caratteri
    useSearchViewModel.mockReturnValue({ 
      players: [], teams: [], nations: [], loading: false 
    });

    render(<SearchResults />);
    expect(screen.getByText(/Inserisci almeno 3 caratteri/i)).toBeInTheDocument();
  });

  test('Deve mostrare "Nessun risultato trovato" se tutte le liste sono vuote', () => {
    mockSearchTerm = 'NonEsiste';
    useSearchViewModel.mockReturnValue({ 
      players: [], teams: [], nations: [], loading: false 
    });

    render(<SearchResults />);
    expect(screen.getByText(/Nessun risultato trovato/i)).toBeInTheDocument();
  });

  test('Deve visualizzare correttamente le sezioni Nazioni, Squadre e Giocatori', () => {
    const mockNations = [{ name: 'Italy', flag: 'url' }];
    const mockTeams = [{ id: 1, name: 'Inter', logo: 'url', country: 'Italy' }];
    const mockPlayers = [{ id: 10, name: 'Barella' }];

    useSearchViewModel.mockReturnValue({ 
      nations: mockNations, 
      teams: mockTeams, 
      players: mockPlayers, 
      loading: false 
    });

    render(<SearchResults />);

    // Verifica intestazioni
    expect(screen.getByText(/Nazioni \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Squadre \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Giocatori \(1\)/i)).toBeInTheDocument();

    // Verifica contenuto card (tramite i mock)
    expect(screen.getByText('Italy')).toBeInTheDocument();
    expect(screen.getByText('Inter')).toBeInTheDocument();
    expect(screen.getByText('Barella')).toBeInTheDocument();
  });

  test('Deve navigare alla pagina corretta cliccando su una Nazione', () => {
    const mockNations = [{ name: 'France', flag: 'url' }];
    useSearchViewModel.mockReturnValue({ 
      nations: mockNations, teams: [], players: [], loading: false 
    });

    render(<SearchResults />);

    // Clicca sulla card della nazione
    const nationCard = screen.getByText('France');
    fireEvent.click(nationCard);

    expect(mockNavigate).toHaveBeenCalledWith('/nazioni/France');
  });

  test('Deve navigare alla pagina corretta cliccando su una Squadra', () => {
    const mockTeams = [{ id: 99, name: 'Juventus', logo: 'url', country: 'Italy' }];
    useSearchViewModel.mockReturnValue({ 
      nations: [], teams: mockTeams, players: [], loading: false 
    });

    render(<SearchResults />);

    // Clicca sulla card della squadra
    const teamCard = screen.getByText('Juventus');
    fireEvent.click(teamCard);

    expect(mockNavigate).toHaveBeenCalledWith('/squadre/99/giocatori');
  });
});