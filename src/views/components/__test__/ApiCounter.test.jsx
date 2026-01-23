import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import ApiCounter from '../ApiCounter';
import PlayerService from '../../../services/PlayerService';

vi.mock('../../../services/PlayerService', () => ({
  default: {
    getApiUsage: vi.fn()
  }
}));

describe('ApiCounter Component', () => {
  const mockUsage = {
    used: 45,
    limit: 100,
    remaining: 55,
    percentage: 45,
    date: 'Fri Jan 23 2026'
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(PlayerService.getApiUsage).mockReturnValue(mockUsage);
  });

  test('Deve mostrare il badge compatto con il conteggio iniziale', () => {
    render(<ApiCounter />);
    expect(screen.getByText('45/100')).toBeInTheDocument();
  });

  test('Deve espandersi al click e mostrare i dettagli di utilizzo', async () => {
    render(<ApiCounter />);
    const badgeElement = screen.getByText('45/100').parentElement;
    fireEvent.click(badgeElement);
    
    expect(screen.getByText('API Usage')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument();
  });

  test('Deve aggiornare i dati periodicamente tramite interval', () => {
    render(<ApiCounter />);
    const updatedUsage = { ...mockUsage, used: 50, percentage: 50 };
    vi.mocked(PlayerService.getApiUsage).mockReturnValue(updatedUsage);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('50/100')).toBeInTheDocument();
  });
});