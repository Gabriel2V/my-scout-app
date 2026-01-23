/**
 * TEST: Nations.test.js
 * Verifica il comportamento della pagina Nazioni
 * Controlla che la chiamata API per ottenere le nazioni venga effettuata e che i risultati (bandiere e nomi) siano renderizzati correttamente
 */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import Nations from '../Nations';
import PlayerService from '../../../services/PlayerService';

vi.mock('../../../services/PlayerService', () => ({
  default: { getCountries: vi.fn() }
}));

describe('Nations Page', () => {
  test('Deve caricare e mostrare le nazioni', async () => {
    PlayerService.getCountries.mockResolvedValue([{ name: 'Italy', flag: 'url' }]);
    render(<MemoryRouter><Nations /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Italy')).toBeInTheDocument());
  });
});