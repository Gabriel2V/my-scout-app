/** 
 * @file ApiDebug.test.jsx 
 * @description Test per la dashboard tecnica, verifica la visualizzazione delle statistiche e il funzionamento dei tasti di manutenzione. 
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import ApiDebug from '../ApiDebug';
import { useApiUsageViewModel } from '../../../viewmodels/useApiUsageViewModel';

vi.mock('../../../viewmodels/useApiUsageViewModel', () => ({
  useApiUsageViewModel: vi.fn()
}));

describe('ApiDebug Page', () => {
  const mockReset = vi.fn();
  const mockClearCache = vi.fn();

  const mockUsage = {
    used: 45,
    limit: 100,
    remaining: 55,
    percentage: 45,
    date: '01/01/2026'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApiUsageViewModel).mockReturnValue({
      usage: mockUsage,
      config: { baseUrl: 'https://v3.football.api', isConfigured: true },
      resetCounter: mockReset,
      clearCache: mockClearCache
    });
    
    // Mock di window.confirm e alert
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  test('Deve renderizzare le statistiche correttamente', () => {
    render(<ApiDebug />);
    expect(screen.getByText('45')).toBeInTheDocument(); // Used
    expect(screen.getByText('55')).toBeInTheDocument(); // Remaining
    const percentageTexts = screen.getAllByText(/45%/i);
    expect(percentageTexts.length).toBeGreaterThan(0);// Percentage bar text
    expect(screen.getByText('https://v3.football.api')).toBeInTheDocument();
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