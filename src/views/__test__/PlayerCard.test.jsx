/**
 * TEST: PlayerCard.test.js
 * Unit test per il componente PlayerCard
 * Si assicura che le props (nome, foto, rating) siano visualizzate nel DOM e che il link di navigazione ("Dettaglio") punti all'URL corretto
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom'; 
import React from 'react';
import { PlayerCard } from '../PlayerCard';

describe('Componente PlayerCard', () => {
  const mockPlayer = { id: 10, name: 'Kenan Yildiz', photo: 'url', rating: '7.8', team: 'Juventus' };

  test('Deve mostrare il nome del giocatore e il rating', () => {
    render(<MemoryRouter><PlayerCard player={mockPlayer} /></MemoryRouter>);
    expect(screen.getByText('Kenan Yildiz')).toBeInTheDocument();
    expect(screen.getByText(/Rating: 7.8/i)).toBeInTheDocument();
  });

  test('Il bottone Dettaglio deve avere il link corretto', () => {
    render(<MemoryRouter><PlayerCard player={mockPlayer} /></MemoryRouter>);
    const linkElement = screen.getByRole('link', { name: /Dettaglio/i });
    expect(linkElement).toHaveAttribute('href', '/giocatori/10');
  });
});