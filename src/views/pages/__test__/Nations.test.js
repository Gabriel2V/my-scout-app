/**
 * TEST: Nations.test.js
 * Verifica il comportamento della pagina Nazioni
 * Controlla che la chiamata API per ottenere le nazioni venga effettuata e che i risultati (bandiere e nomi) siano renderizzati correttamente
 */
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import Nations from '../Nations';
import PlayerService from '../../../services/PlayerService';

jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true });
jest.mock('../../../services/PlayerService');

describe('Nations Page', () => {
  test('Deve caricare e mostrare le nazioni', async () => {
    PlayerService.getCountries.mockResolvedValue([{ name: 'Italy', flag: 'url' }]);
    render(<Nations />);
    await waitFor(() => expect(screen.getByText('Italy')).toBeInTheDocument());
  });
});