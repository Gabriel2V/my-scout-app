/**
 * PAGE: Players.jsx
 * Visualizza la lista dei giocatori con supporto per Infinite Scroll
 * Integra la barra dei filtri (ruolo, rating) e gestisce la navigazione al dettaglio
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { usePlayersViewModel } from '../../viewmodels/usePlayersViewModel';
import GenericCard from '../components/GenericCard';
import FilterBar from '../components/FilterBar';

export default function Players() {
  const { searchTerm } = useOutletContext();
  const { players, loading } = usePlayersViewModel();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [roleFilter, setRoleFilter] = useState('All');
  const [minRating, setMinRating] = useState(0);

  // Infinite Scroll settings
  const ITEMS_PER_BATCH = 12;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_BATCH);
    window.scrollTo(0, 0);
  }, [searchTerm, roleFilter, minRating, location.pathname]);

  const getRatingValue = (rating) => {
    if (!rating || rating === "N/A") return null;
    const val = parseFloat(rating);
    return isNaN(val) ? -1 : val;
  };

  const filteredPlayers = players.filter(p => {
    const matchesName = p.name.toLowerCase().includes(searchTerm?.toLowerCase() || '');
    const matchesRole = roleFilter === 'All' || p.position === roleFilter;
    const pRating = getRatingValue(p.rating);
    let matchesRating;
    if (minRating === 0 || minRating === "0") {
      matchesRating = true;
    } else {
      matchesRating = pRating !== null && pRating >= parseFloat(minRating);
    }
    return matchesName && matchesRating && matchesRole;
  });

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    const rateA = getRatingValue(a.rating);
    const rateB = getRatingValue(b.rating);
    if (rateA === null && rateB === null) return 0;
    if (rateA === null) return 1;
    if (rateB === null) return -1;
    return rateB - rateA;
  });

  const currentItems = sortedPlayers.slice(0, visibleCount);
  const hasMore = visibleCount < sortedPlayers.length;

  const observer = useRef();
  
  const lastPlayerElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setVisibleCount(prevCount => prevCount + ITEMS_PER_BATCH);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Funzione helper per la navigazione
// Funzione helper per la navigazione
  const goToDetail = (player) => {
    navigate(`/giocatori/${player.id}`, { 
      state: { 
        player: player, 
        contextList: sortedPlayers,
        from: location.pathname 
      } 
    });
  };
  if (loading && visibleCount === ITEMS_PER_BATCH) {
    return <div className="loading">Analisi database in corso...</div>;
  }

  return (
    <div>
      <h2 className="pageTitle">Scouting Report</h2>
      
      <FilterBar 
        minRating={minRating} setMinRating={setMinRating}
        roleFilter={roleFilter} setRoleFilter={setRoleFilter}
      />

      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem'}}>
        <span>Visualizzati: <strong>{currentItems.length}</strong> {/*su {sortedPlayers.length}*/}</span>
      </div>

      <div className="grid">
        {currentItems.length > 0 ? (
          currentItems.map((p, index) => {
            if (currentItems.length === index + 1) {
              return (
                <div ref={lastPlayerElementRef} key={p.id}>
                  <GenericCard 
                    title={p.name}
                    image={p.photo}
                    subtitle={`Rating: ${p.rating} | ${p.position}`}
                    variant="circle"
                    onClick={() => goToDetail(p)}
                  />
                </div>
              );
            } else {
              return (
                <GenericCard 
                  key={p.id}
                  title={p.name}
                  image={p.photo}
                  subtitle={`Rating: ${p.rating} | ${p.position}`}
                  variant="circle"
                  onClick={() => goToDetail(p)}
                />
              );
            }
          })
        ) : (
          <p style={{gridColumn: '1/-1', textAlign:'center', padding: '2rem'}}>
            Nessun giocatore corrisponde ai criteri di ricerca.
          </p>
        )}
      </div>

      {hasMore && (
        <div style={{textAlign: 'center', padding: '2rem', color: '#64748b', opacity: 0.7}}>
          Caricamento altri talenti...
        </div>
      )}
      
      {!hasMore && currentItems.length > 0 && (
        <div style={{textAlign: 'center', padding: '2rem', color: '#10b981', fontWeight: 'bold'}}>
          ✅ Hai visualizzato tutti i giocatori disponibili.
        </div>
      )}
    </div>
  );
}