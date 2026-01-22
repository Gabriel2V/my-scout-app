/**
 * TEST: PlayerCard.test.js
 * Unit test per il componente PlayerCard
 * Si assicura che le props (nome, foto, rating) siano visualizzate nel DOM e che il link di navigazione ("Dettaglio") punti all'URL corretto
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import React from 'react';
import { PlayerCard } from '../PlayerCard';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}), { virtual: true });

describe('Componente PlayerCard', () => {
  const mockPlayer = {
    id: 10,
    name: 'Kenan Yildiz',
    photo: 'photo_url',
    rating: '7.8',
    team: 'Juventus'
  };

  test('Deve mostrare il nome del giocatore e il rating', () => {
    render(<PlayerCard player={mockPlayer} />);

    expect(screen.getByText('Kenan Yildiz')).toBeInTheDocument();
    expect(screen.getByText(/Rating: 7.8/i)).toBeInTheDocument();
  });

  test('Il bottone Dettaglio deve avere il link corretto', () => {
    render(<PlayerCard player={mockPlayer} />);

    const linkElement = screen.getByRole('link', { name: /Dettaglio/i });
    expect(linkElement).toHaveAttribute('href', '/giocatori/10');
  });
});