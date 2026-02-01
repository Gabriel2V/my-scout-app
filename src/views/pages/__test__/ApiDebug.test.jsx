/**
 * TEST: ApiDebug Page
 * Verifica le interazioni della dashboard di debug.
 * Controlla che i bottoni di Reset e Pulizia Cache invochino correttamente i metodi del ViewModel.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import ApiDebug from '../ApiDebug';
import { useApiUsageViewModel } from '../../../viewmodels/useApiUsageViewModel';

vi.mock('../../../viewmodels/useApiUsageViewModel');

describe('ApiDebug Page', () => {
  const mockReset = vi.fn();
  const mockClearCache = vi.fn();

  const mockUsage = {
    used: 90,
    limit: 100,
    remaining: 10,
    percentage: 90
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApiUsageViewModel).mockReturnValue({
      usage: mockUsage,
      resetCounter: mockReset,
      clearCache: mockClearCache
    });
    
    // Mock di window.confirm e alert
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  test('Deve renderizzare le statistiche correttamente', () => {
    render(<ApiDebug />);
    expect(screen.getByText('90')).toBeInTheDocument(); // Used
    expect(screen.getByText('10')).toBeInTheDocument(); // Remaining
    expect(screen.getByText('90%')).toBeInTheDocument(); // Percentage bar text
  });

  test('Il click su Reset deve attivare la funzione del ViewModel', () => {
    render(<ApiDebug />);
    const resetBtn = screen.getByText(/Reset Contatore/i);
    
    fireEvent.click(resetBtn);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockReset).toHaveBeenCalled();
  });

  test('Il click su Pulisci Cache deve attivare la funzione del ViewModel', () => {
    render(<ApiDebug />);
    const clearBtn = screen.getByText(/Pulisci Cache/i);
    
    fireEvent.click(clearBtn);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockClearCache).toHaveBeenCalled();
  });
});