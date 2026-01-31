/**
 * PAGE: Players.jsx
 * Visualizza la lista dei giocatori con supporto per Infinite Scroll
 * Integra la barra dei filtri (ruolo, rating) e gestisce la navigazione al dettaglio
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePlayersViewModel } from '../../viewmodels/usePlayersViewModel';
import GenericCard from '../components/GenericCard';
import FilterBar from '../components/FilterBar';

export default function Players() {
  const { players, loading, loadMore, hasMoreRemote } = usePlayersViewModel();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [localSearch, setLocalSearch] = useState(''); 
  const [roleFilter, setRoleFilter] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [natFilter, setNatFilter] = useState('All');
  const [sortKey, setSortKey] = useState('rating');

  const ITEMS_PER_BATCH = 12;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH);

  const nationsList = useMemo(() => {
    const nats = players.map(p => p.nationality).filter(Boolean);
    return [...new Set(nats)].sort();
  }, [players]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_BATCH);
    window.scrollTo(0, 0);
  }, [localSearch, roleFilter, minRating, natFilter, sortKey, location.pathname]);

  const getRatingValue = (rating) => {
    if (!rating || rating === "N/A") return null;
    const val = parseFloat(rating);
    return isNaN(val) ? -1 : val;
  };

  const filteredPlayers = players.filter(p => {
    const matchesName = p.name.toLowerCase().includes(localSearch.toLowerCase());
    const matchesRole = roleFilter === 'All' || p.position === roleFilter;
    const matchesNat = natFilter === 'All' || p.nationality === natFilter;
    const pRating = getRatingValue(p.rating);
    let matchesRating = (minRating === 0 || minRating === "0") ? true : (pRating !== null && pRating >= parseFloat(minRating));

    return matchesName && matchesRating && matchesRole && matchesNat;
  });

  const sortedPlayers = useMemo(() => {
    return [...filteredPlayers].sort((a, b) => {
      if (sortKey === 'goals') return b.goals - a.goals;
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      const rateA = getRatingValue(a.rating);
      const rateB = getRatingValue(b.rating);
      if (rateA === null) return 1;
      if (rateB === null) return -1;
      return rateB - rateA;
    });
  }, [filteredPlayers, sortKey]);

  const currentItems = sortedPlayers.slice(0, visibleCount);
  const hasMoreLocal = visibleCount < sortedPlayers.length;

  const observer = useRef();

  const lastPlayerElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (hasMoreLocal) {
            setVisibleCount(prev => prev + ITEMS_PER_BATCH);
        } else if (hasMoreRemote) {
            console.log("Fine lista locale -> Richiedo prossima lega...");
            loadMore();
        }
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMoreLocal, hasMoreRemote, loadMore]);
  return (
    <div>
      <h2 className="pageTitle">Scouting Report</h2>
      
      <div style={{marginBottom: '1rem'}}>
        <input 
          type="text" 
          placeholder="Filtra per nome in questa lista..." 
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          style={{padding: '0.8rem 1.2rem', borderRadius: '10px', border: '1px solid #e2e8f0', width: '100%', maxWidth: '400px'}}
        />
      </div>

      <FilterBar 
        minRating={minRating} setMinRating={setMinRating}
        roleFilter={roleFilter} setRoleFilter={setRoleFilter}
        natFilter={natFilter} setNatFilter={setNatFilter}
        nationsList={nationsList}
        sortKey={sortKey} setSortKey={setSortKey}
      />

      <div style={{marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem'}}>
        Trovati: <strong>{sortedPlayers.length}</strong> talenti
      </div>

      <div className="grid">
        {currentItems.map((p, index) => (
          <div key={p.id} ref={currentItems.length === index + 1 ? lastPlayerElementRef : null}>
            <GenericCard 
              title={p.name} 
              image={p.photo} 
              subtitle={`${p.position} | Rating: ${p.rating} | Gol: ${p.goals}`} 
              variant="circle"
              onClick={() => navigate(`/giocatori/${p.id}`, { state: { player: p, contextList: sortedPlayers, from: location.pathname } })} 
            />
          </div>
        ))}
      </div>
      {loading && <div className="loading">Analisi database in corso...</div>}
      {!loading && !hasMoreLocal && !hasMoreRemote && sortedPlayers.length > 0 && (
          <div style={{textAlign: 'center', padding: '2rem', color: '#94a3b8'}}>
            -- Fine Scouting Report --
          </div>
      )}
    </div>
  );
}