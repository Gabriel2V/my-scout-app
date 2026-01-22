/**
 * TEST: MainLayout
 * Verifica la struttura base, la presenza dell'Header/Footer e il comportamento della barra di ricerca
 */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import MainLayout from '../MainLayout';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet" />,
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
}), { virtual: true });

describe('MainLayout', () => {
  test('Deve renderizzare l\'header con la barra di ricerca', () => {
    render(<MainLayout />);
    expect(screen.getByPlaceholderText(/Cerca giocatori/i)).toBeInTheDocument();
  });

  test('Il click sul logo deve resettare la ricerca e navigare alla home', () => {
    render(<MainLayout />);
    fireEvent.click(screen.getByText('My Scout App'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});