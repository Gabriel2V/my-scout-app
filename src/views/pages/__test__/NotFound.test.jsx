import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import NotFound from '../NotFound';

// Mock di useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('Pagina NotFound', () => {
  test('Deve mostrare il messaggio di errore 404', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText(/404 - Fuorigioco!/i)).toBeInTheDocument();
  });

  test('Il bottone deve riportare alla home', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    
    const button = screen.getByRole('button', { name: /Torna alla Dashboard/i });
    fireEvent.click(button);
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});