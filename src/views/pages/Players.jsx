/**
 * PAGE: Players.jsx
 * Visualizza la lista dei giocatori con supporto per Infinite Scroll
 * Integra la barra dei filtri (ruolo, rating) e gestisce la navigazione al dettaglio
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
  
  const [localSearch, setLocalSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [natFilter, setNatFilter] = useState('All');
  const [sortKey, setSortKey] = useState('default');
  const [visibleCount, setVisibleCount] = useState(12);

  const nationsList = useMemo(() => {
    const nats = players.map(p => p.nationality).filter(Boolean);
    return [...new Set(nats)].sort();
  }, [players]);

  useEffect(() => { setVisibleCount(12); }, [players.length, localSearch, roleFilter, minRating, natFilter]);

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

const sorted = useMemo(() => {
    if (sortKey === 'default') {
      return filtered;
    }
    return [...filtered].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      // Rating / Goals
      const rA = parseFloat(a.rating) || 0;
      const rB = parseFloat(b.rating) || 0;
      return rB - rA;
    });
  }, [filtered, sortKey]);

  const currentItems = sorted.slice(0, visibleCount);
  const observer = useRef();

  const lastPlayerRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (visibleCount < sorted.length) {
          setVisibleCount(prev => prev + 12);
        } else if (hasMoreRemote) {
          loadMore(); // Carica la pagina successiva
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
                    contextList: sorted,
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