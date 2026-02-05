import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import GenericCard from '../GenericCard';

describe('GenericCard', () => {
  const mockClick = vi.fn();

  test('Deve renderizzare titolo, sottotitolo e immagine', () => {
    render(
      <GenericCard 
        title="Juventus" 
        subtitle="Serie A" 
        image="logo.png" 
        onClick={mockClick} 
      />
    );

    expect(screen.getByText('Juventus')).toBeInTheDocument();
    expect(screen.getByText('Serie A')).toBeInTheDocument();
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'logo.png');
    expect(img).toHaveAttribute('alt', 'Juventus');
  });

  test('Deve gestire il click sulla card', () => {
    render(<GenericCard title="Test" onClick={mockClick} />);
    fireEvent.click(screen.getByText('Test'));
    expect(mockClick).toHaveBeenCalled();
  });

  test('Deve renderizzare children (contenuto extra) se passati', () => {
    render(
      <GenericCard title="Test">
        <button>Extra Action</button>
      </GenericCard>
    );
    expect(screen.getByText('Extra Action')).toBeInTheDocument();
  });
});