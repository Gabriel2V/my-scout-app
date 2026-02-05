/**
 * @module App
 * @description Configurazione delle rotte dell'applicazione tramite React Router.
 * Definisce la gerarchia degli URL e l'integrazione tra Layout e Pagine.
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
          <Route index element={<Home />} />
          <Route path="nazioni" element={<Nations />} />
          <Route path="ricerca" element={<SearchResults />} />
          <Route path="giocatori" element={<Players />} />
          <Route path="nazioni/:nazioneId" element={<Series />} />
          <Route path="nazionali" element={<NationalTeams />} />
          <Route path="info" element={<Info />} />
          <Route path="nazioni/:nazioneId/serie/:serieId/squadre" element={<Teams />} />
          <Route path="nazioni/:nazioneId/serie/:serieId/giocatori" element={<Players />} />
          <Route path="squadre/:squadraId/giocatori" element={<Players />} />
          <Route path="giocatori/:id" element={<PlayerDetailView />} /> 
          <Route path="api-debug" element={<ApiDebug />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;