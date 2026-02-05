import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import NationalTeams from '../NationalTeams';
import { useNationalTeamsViewModel } from '../../../viewmodels/useNationalTeamsViewModel';

// Mock del ViewModel
vi.mock('../../../viewmodels/useNationalTeamsViewModel');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('NationalTeams Page', () => {
  test('Deve mostrare le card delle nazionali caricate', () => {
    vi.mocked(useNationalTeamsViewModel).mockReturnValue({
      teams: [{ id: 1, name: 'Brazil', logo: 'brazil.png' }],
      loading: false
    });

    render(<MemoryRouter><NationalTeams /></MemoryRouter>);

    expect(screen.getByText('Brazil')).toBeInTheDocument();
    expect(screen.getByText('Vedi Rosa Convocati')).toBeInTheDocument();
  });

  test('Deve mostrare il loading', () => {
    vi.mocked(useNationalTeamsViewModel).mockReturnValue({
      teams: [],
      loading: true
    });

    render(<MemoryRouter><NationalTeams /></MemoryRouter>);
    expect(screen.getByText(/Convocazione nazionali in corso/i)).toBeInTheDocument();
  });
});