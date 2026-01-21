/**
 * VIEW: Players.jsx
 * Mostra l'elenco dei giocatori con filtri, ordinamento per rating e paginazione.
 */
import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { usePlayersViewModel } from '../../viewmodels/usePlayersViewModel';
import GenericCard from '../components/GenericCard';
import FilterBar from '../components/FilterBar';

export default function Players() {
  const { searchTerm } = useOutletContext();
  const { players, loading } = usePlayersViewModel();
  const navigate = useNavigate();
  
  // Stati filtri
  const [roleFilter, setRoleFilter] = useState('All');
  const [minRating, setMinRating] = useState(0);

  // Stati paginazione
  const [currentPage, setCurrentPage] = useState(1);
  
  // 12 per pagina
  const itemsPerPage = 12; 

  // Reset pagina quando cambiano i filtri
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, minRating]);

  // Helper per convertire il rating in numero sicuro (N/A diventa -1)
  const getRatingValue = (rating) => {
    if (!rating || rating === "N/A") return null;
    const val = parseFloat(rating);
    return isNaN(val) ? -1 : val;
  };

  if (loading) return <div className="loading">Analisi database in corso...</div>;

  // --- FILTRAGGIO ---
  const filteredPlayers = players.filter(p => {
    const matchesName = p.name.toLowerCase().includes(searchTerm?.toLowerCase() || '');
    const matchesRole = roleFilter === 'All' || p.position === roleFilter;
    const pRating = getRatingValue(p.rating);
    let matchesRating;
    if (minRating === 0 || minRating === "0") {
      // Se minRating è 0, mostra TUTTI i giocatori (inclusi N/A)
      matchesRating = true;
    } else {
      // Se minRating > 0, mostra solo chi ha rating valido E >= minRating
      matchesRating = pRating !== null && pRating >= parseFloat(minRating);
    }
    return matchesName && matchesRating && matchesRole;
  });

  // --- ORDINAMENTO (Default: Top Rating) ---
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    const rateA = getRatingValue(a.rating);
    const rateB = getRatingValue(b.rating);

    // Chi ha rating null (N/A) va in fondo
    if (rateA === null && rateB === null) return 0;
    if (rateA === null) return 1;
    if (rateB === null) return -1;

    // Ordine decrescente: i migliori in cima
    return rateB - rateA;
  });

  // --- PAGINAZIONE ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedPlayers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedPlayers.length / itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0, 0); 
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div>
      <h2 className="pageTitle">Scouting Report</h2>
      
      <FilterBar 
        minRating={minRating} setMinRating={setMinRating}
        roleFilter={roleFilter} setRoleFilter={setRoleFilter}
      />

      {/* Info Risultati */}
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem', 
        color: '#64748b',
        fontSize: '0.9rem'
      }}>
        <span>Trovati: <strong>{sortedPlayers.length}</strong> talenti</span>
        <span>Pagina {currentPage} di {totalPages || 1}</span>
      </div>

      {/* Griglia Card */}
      <div className="grid">
        {currentItems.length > 0 ? (
          currentItems.map(p => (
            <GenericCard 
              key={p.id}
              title={p.name}
              image={p.photo}
              subtitle={`Rating: ${p.rating} | ${p.position}`}
              variant="circle"
              onClick={() => navigate(`/giocatori/${p.id}`, { state: { player: p } })}
            />
          ))
        ) : (
          <p style={{gridColumn: '1/-1', textAlign:'center', padding: '2rem'}}>
            Nessun giocatore corrisponde ai criteri di ricerca.
          </p>
        )}
      </div>

      {/* Navigazione Pagine */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '1.5rem', 
          marginTop: '3rem',
          paddingBottom: '2rem'
        }}>
          <button 
            onClick={handlePrev}
            disabled={currentPage === 1}
            style={{
              background: currentPage === 1 ? '#e2e8f0' : '#0f172a',
              color: currentPage === 1 ? '#94a3b8' : 'white',
              border: 'none', borderRadius: '50%',
              width: '48px', height: '48px', fontSize: '1.2rem', 
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            ←
          </button>

          <span style={{fontSize: '1.1rem', fontWeight: '600', color: '#0f172a'}}>
            {currentPage} <span style={{fontWeight: '400', color: '#64748b'}}>/ {totalPages}</span>
          </span>

          <button 
            onClick={handleNext}
            disabled={currentPage === totalPages}
            style={{
              background: currentPage === totalPages ? '#e2e8f0' : '#0f172a',
              color: currentPage === totalPages ? '#94a3b8' : 'white',
              border: 'none', borderRadius: '50%',
              width: '48px', height: '48px', fontSize: '1.2rem', 
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}