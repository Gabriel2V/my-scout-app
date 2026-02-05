/**
 * @component Players
 * @description Pagina principale per la visualizzazione e il filtraggio della rosa giocatori.
 * * **Features:**
 * - **Infinite Scroll:** Implementato tramite `IntersectionObserver` per caricare dati on-demand.
 * - **Client-Side Filtering:** Filtra i dati caricati per Nome, Ruolo, Rating e Nazionalità senza ricaricare l'API.
 * - **Dynamic Sorting:** Ordinamento in memoria (Rating, Goal, Nome).
 * - **Context Preservation:** Passa l'intera lista filtrata al dettaglio per la navigazione "Next/Prev".
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayersViewModel } from '../../viewmodels/usePlayersViewModel';
import GenericCard from '../components/GenericCard';
import EmptyState from '../components/EmptyState';
import FilterBar from '../components/FilterBar';

export default function Players() {
  const { players, loading, loadMore, hasMoreRemote } = usePlayersViewModel();
  const navigate = useNavigate();
  
  // Stato filtri locali
  const [localSearch, setLocalSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [natFilter, setNatFilter] = useState('All');
  const [sortKey, setSortKey] = useState('default');
  
  // Stato paginazione locale (rendering batch)
  const [visibleCount, setVisibleCount] = useState(12);

  // Estrae lista univoca nazioni per il dropdown
  const nationsList = useMemo(() => {
    const nats = players.map(p => p.nationality).filter(Boolean);
    return [...new Set(nats)].sort();
  }, [players]);

  // Reset del contatore visibile al cambio filtri
  useEffect(() => { setVisibleCount(12); }, [players.length, localSearch, roleFilter, minRating, natFilter]);

  /** Logica di filtraggio Memoizzata per performance */
  const filtered = useMemo(() => {
    return players.filter(p => {
      const matchesName = p.name.toLowerCase().includes(localSearch.toLowerCase());
      const matchesRole = roleFilter === 'All' || p.position === roleFilter;
      const matchesNat = natFilter === 'All' || p.nationality === natFilter;
      
      const val = parseFloat(p.rating);
      const pRating = (isNaN(val) || !p.rating || p.rating === "N/A") ? null : val;
      const matchesRating = (minRating == 0) ? true : (pRating !== null && pRating >= parseFloat(minRating));
      
      return matchesName && matchesRating && matchesRole && matchesNat;
    });
  }, [players, localSearch, roleFilter, minRating, natFilter]);

  /** Logica di ordinamento */
  const sorted = useMemo(() => {
    if (sortKey === 'default') return filtered;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      // Rating / Goals (Decrescente)
      const rA = parseFloat(a.rating) || 0;
      const rB = parseFloat(b.rating) || 0;
      return rB - rA;
    });
  }, [filtered, sortKey]);

  // Slice dei dati da renderizzare
  const currentItems = sorted.slice(0, visibleCount);
  
  // Ref per l'osservatore dello scroll
  const observer = useRef();

  /**
   * Callback per l'Intersection Observer (Infinite Scroll).
   * Viene attaccata all'ultimo elemento della lista visibile.
   */
  const lastPlayerRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        // Se ho dati locali nascosti, mostrane di più
        if (visibleCount < sorted.length) {
          setVisibleCount(prev => prev + 12);
        } else if (hasMoreRemote) {
          // Se ho finito i dati locali, chiedi al ViewModel di scaricarne altri
          loadMore(); 
        }
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, visibleCount, sorted.length, hasMoreRemote, loadMore]);

  return (
    <div>
      <h2 className="pageTitle">Scouting Report</h2>
      
      <input 
        type="text" placeholder="Filtra per nome..." value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        style={{padding: '0.8rem', borderRadius: '10px', width: '100%', maxWidth: '400px', marginBottom: '1rem'}}
      />

      <FilterBar 
        minRating={minRating} setMinRating={setMinRating}
        roleFilter={roleFilter} setRoleFilter={setRoleFilter}
        natFilter={natFilter} setNatFilter={setNatFilter}
        nationsList={nationsList}
        sortKey={sortKey} setSortKey={setSortKey}
      />

      {!loading && players.length === 0 ? (
        <EmptyState message="Non ci sono giocatori disponibili per questa selezione." icon="player_off" />
      ) : (
        <div className="grid">
          {currentItems.map((p, i) => (
            <div key={`${p.id}-${i}`} ref={currentItems.length === i + 1 ? lastPlayerRef : null}>
              <GenericCard
                title={p.name} image={p.photo} variant="circle"
                subtitle={`${p.position} | Rating: ${p.rating}`}
                onClick={() => navigate(`/giocatori/${p.id}`, { 
                  state: { 
                    player: p, 
                    contextList: sorted, // Passa il contesto filtrato per prev/next
                    from: window.location.pathname 
                  } })}
              />
            </div>
          ))}
      </div>)}
      
      {loading && <div className="loading">Caricamento talenti...</div>}
      
      {!loading && !hasMoreRemote && currentItems.length === sorted.length && (
        <div style={{textAlign: 'center', padding: '2rem', color: 'var(--accent)'}}>-- Rosa Completa --</div>
      )}
    </div>
  );
}