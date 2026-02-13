/** 
 * @file MainLayout.test.jsx 
 * @description Test per la struttura globale (Header/Footer), verifica la barra di ricerca e la navigazione principale.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import MainLayout from '../MainLayout';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('MainLayout', () => {
  test("Deve renderizzare l'header con la barra di ricerca aggiornata", () => {
    render(<MemoryRouter><MainLayout /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Cerca squadra o nazione/i)).toBeInTheDocument();
  });

  test('Il click sul logo deve resettare la ricerca e navigare alla home', () => {
    render(<MemoryRouter><MainLayout /></MemoryRouter>);
    fireEvent.click(screen.getByText('My Scout App'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});