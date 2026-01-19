/**
 * VIEW: PlayerListView.jsx
 * Pagina principale che mostra l'elenco filtrabile
 */
import { usePlayersViewModel } from '../viewmodels/usePlayersViewModel';
import { PlayerCard } from './PlayerCard';

export function PlayerListView() {
  const { players, searchTerm, setSearchTerm, loading } = usePlayersViewModel();

  if (loading) return <div>Caricamento scouting report...</div>;

  return (
    <main>
      <input 
        type="text" 
        placeholder="Cerca calciatore..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} // Binding bidirezionale 
      />
      <div className="grid">
        {players.map(p => <PlayerCard key={p.id} player={p} />)}
      </div>
    </main>
  );
}