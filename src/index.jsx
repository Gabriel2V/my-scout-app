/**
 * @module Index
 * @description Punto di ingresso (Entry Point) dell'applicazione React.
 * * **Responsabilità:**
 * - Iniezione dell'applicazione nel DOM (`root` element).
 * - Importazione degli stili globali (`index.css` e `globals.css`).
 * - Attivazione di `React.StrictMode` per controlli aggiuntivi in fase di sviluppo (es. rilevamento doppi render).
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/globals.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

