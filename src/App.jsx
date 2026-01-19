/**
 * MAIN: App.jsx
 * Configura il routing dell'applicazione (SPA)
 * Utilizza HashRouter per facilitare il deploy su GitHub Pages
 */
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { PlayerListView } from './views/PlayerListView';
import { PlayerDetailView } from './views/PlayerDetailView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PlayerListView />} /> [cite: 1022, 1055]
        {/* Rotta dinamica per il dettaglio del calciatore */}
        <Route path="/player/:id" element={<PlayerDetailView />} />
        {/* Fallback per pagine non trovate */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}
export default App;