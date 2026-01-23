import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import FilterBar from '../FilterBar';

describe('FilterBar Component', () => {
  const mockProps = {
    minRating: 5,
    setMinRating: vi.fn(),
    roleFilter: 'All',
    setRoleFilter: vi.fn(),
    natFilter: 'All',
    setNatFilter: vi.fn(),
    nationsList: ['Italy', 'Argentina'],
    sortKey: 'rating',
    setSortKey: vi.fn()
  };

  test('Deve renderizzare correttamente tutti i filtri e le opzioni', () => {
    render(<FilterBar {...mockProps} />);
    
    // Gestione del testo spezzato tra label e span
    expect(screen.getByText((content, node) => {
      const hasText = (node) => node.textContent === "Rating Minimo: 5";
      const nodeHasText = hasText(node);
      const childrenDontHaveText = Array.from(node.children).every(
        (child) => !hasText(child)
      );
      return nodeHasText && childrenDontHaveText;
    })).toBeInTheDocument();

    expect(screen.getByText('Italy')).toBeInTheDocument();
    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Miglior Rating')).toBeInTheDocument();
  });

  test('Deve chiamare setSortKey quando cambia l\'ordinamento', () => {
    render(<FilterBar {...mockProps} />);
    const select = screen.getByDisplayValue('Miglior Rating');
    fireEvent.change(select, { target: { value: 'goals' } });
    expect(mockProps.setSortKey).toHaveBeenCalledWith('goals');
  });

  test('Deve chiamare setNatFilter quando cambia la nazione', () => {
    render(<FilterBar {...mockProps} />);
    const select = screen.getByDisplayValue('Tutte le nazioni');
    fireEvent.change(select, { target: { value: 'Italy' } });
    expect(mockProps.setNatFilter).toHaveBeenCalledWith('Italy');
  });
});