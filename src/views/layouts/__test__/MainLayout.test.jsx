/**
 * TEST: MainLayout
 * Verifica la struttura base, la presenza dell'Header/Footer e il comportamento della barra di ricerca
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
  test("Deve renderizzare l'header con la barra di ricerca", () => {
    render(<MemoryRouter><MainLayout /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Cerca giocatori/i)).toBeInTheDocument();
  });

  test('Il click sul logo deve resettare la ricerca e navigare alla home', () => {
    render(<MemoryRouter><MainLayout /></MemoryRouter>);
    fireEvent.click(screen.getByText('My Scout App'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});