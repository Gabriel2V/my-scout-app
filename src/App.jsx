/**
 * @module App
 * @description Componente Root che definisce l'albero di routing dell'applicazione.
 * Tecnologia:
 * - Utilizza `HashRouter` per garantire la compatibilità con hosting statici (es. GitHub Pages).
 * Struttura:
 * - Definisce `MainLayout` come wrapper principale per tutte le rotte.
 * - Gestisce le rotte nidificate per la navigazione gerarchica (Nazioni -> Serie -> Squadre).
 * - Mappa la rotta `*` (wildcard) al componente `NotFound`.
 */
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './views/layouts/MainLayout';
import Home from './views/pages/Home';
import Nations from './views/pages/Nations';
import Series from './views/pages/Series';
import Teams from './views/pages/Teams';
import Players from './views/pages/Players';
import SearchResults from './views/pages/SearchResults';
import PlayerDetailView from './views/PlayerDetailView';
import ApiDebug from './views/pages/ApiDebug';
import NotFound from './views/pages/NotFound';
import NationalTeams from './views/pages/NationalTeams';
import Info from './views/pages/Info';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Dashboard */}
          <Route index element={<Home />} />
          
          {/* Flusso Gerarchico: Nazioni -> Serie -> Squadre */}
          <Route path="nazioni" element={<Nations />} />
          <Route path="nazioni/:nazioneId" element={<Series />} />
          <Route path="nazioni/:nazioneId/serie/:serieId/squadre" element={<Teams />} />
          
          {/* Liste Giocatori (Contestuali) */}
          <Route path="nazioni/:nazioneId/serie/:serieId/giocatori" element={<Players />} />
          <Route path="squadre/:squadraId/giocatori" element={<Players />} />
          <Route path="nazionali" element={<NationalTeams />} />
          
          {/* Ricerca e Dettaglio */}
          <Route path="ricerca" element={<SearchResults />} />
          <Route path="giocatori" element={<Players />} /> {/* Global Top Players */}
          <Route path="giocatori/:id" element={<PlayerDetailView />} /> 
          
          {/* Pagine Statiche / Utility */}
          <Route path="info" element={<Info />} />
          <Route path="api-debug" element={<ApiDebug />} />
          
          {/* Fallback 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;