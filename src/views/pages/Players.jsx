/**
 * VIEW: PlayerListView.jsx
 * Pagina principale che mostra l'elenco filtrabile con filtri avanzati
 */
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { usePlayersViewModel } from '../../viewmodels/usePlayersViewModel';
import { PlayerCard } from '../PlayerCard';

export default function Players() {
  const { searchTerm } = useOutletContext();
  const { players, loading } = usePlayersViewModel(); // Rimosso searchTerm dal VM, lo gestiamo qui localmente

  // Stati locali per i filtri
  const [roleFilter, setRoleFilter] = useState('All');
  const [minRating, setMinRating] = useState(0);

  if (loading) return <div className="loading">Caricamento giocatori...</div>;

  // Logica di filtraggio combinata
  const filteredPlayers = players.filter(p => {
    const matchesName = p.name.toLowerCase().includes(searchTerm?.toLowerCase() || '');
    const matchesRating = parseFloat(p.rating || 0) >= minRating;
    
    // Nota: L'oggetto Player attuale potrebbe non avere il ruolo esplicito (dipende dall'API 'position').
    // Se non c'è nel model, questo filtro per ora è un placeholder o richiede aggiornamento Model.
    // Assumiamo che p.position esista o lo ignoriamo se non c'è.
    const matchesRole = roleFilter === 'All' || (p.position && p.position === roleFilter);

    return matchesName && matchesRating && matchesRole;
  });

  return (
    <div>
      <h2 className="pageTitle">Lista Giocatori</h2>
      
      {/* BARRA DEI FILTRI */}
      <div style={{
        backgroundColor: 'white', 
        padding: '1rem', 
        borderRadius: '8px', 
        marginBottom: '2rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
      }}>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <label style={{fontSize: '0.8rem', fontWeight: 'bold', color: '#555'}}>Rating Minimo: {minRating}</label>
          <input 
            type="range" 
            min="0" 
            max="10" 
            step="0.5"
            value={minRating} 
            onChange={(e) => setMinRating(parseFloat(e.target.value))}
            style={{accentColor: '#003366'}}
          />
        </div>
        
        {/* Placeholder per filtro ruolo se implementato nel model */}
        {/* <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd'}}
        >
            <option value="All">Tutti i Ruoli</option>
            <option value="Attacker">Attaccanti</option>
            <option value="Midfielder">Centrocampisti</option>
            <option value="Defender">Difensori</option>
            <option value="Goalkeeper">Portieri</option>
        </select> 
        */}
      </div>

      <div className="grid">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map(p => <PlayerCard key={p.id} player={p} />)
        ) : (
          <p style={{gridColumn: '1 / -1', textAlign: 'center', padding: '2rem'}}>
            Nessun giocatore corrisponde ai criteri di ricerca.
          </p>
        )}
      </div>
    </div>
  );
}