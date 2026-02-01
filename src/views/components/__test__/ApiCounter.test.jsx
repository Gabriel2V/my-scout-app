/**
 * TEST: ApiCounter Component
 * Test unitario per il widget di monitoraggio API.
 * Verifica la corretta visualizzazione dei dati passati dal ViewModel e l'espansione/chiusura del widget.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import ApiCounter from '../ApiCounter';
import { useApiUsageViewModel } from '../../../viewmodels/useApiUsageViewModel';

// Mock del ViewModel
vi.mock('../../../viewmodels/useApiUsageViewModel');

describe('ApiCounter Component', () => {
  const mockUsage = {
    used: 45,
    limit: 100,
    remaining: 55,
    percentage: 45
  };

  test('Deve mostrare i dati forniti dal ViewModel', () => {
    vi.mocked(useApiUsageViewModel).mockReturnValue({ usage: mockUsage });
    
    render(<ApiCounter />);
    expect(screen.getByText('45/100')).toBeInTheDocument();
  });

  test('Deve espandersi al click', () => {
    vi.mocked(useApiUsageViewModel).mockReturnValue({ usage: mockUsage });
    
    render(<ApiCounter />);
    const badge = screen.getByText('45/100').closest('div');
    fireEvent.click(badge);
    
    expect(screen.getByText('API Usage')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument(); // Rimanenti
  });

  test('Non deve renderizzare nulla se usage è null', () => {
    vi.mocked(useApiUsageViewModel).mockReturnValue({ usage: null });
    const { container } = render(<ApiCounter />);
    expect(container).toBeEmptyDOMElement();
  });
});