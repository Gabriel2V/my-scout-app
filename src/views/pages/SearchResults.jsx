import { useOutletContext, useNavigate } from 'react-router-dom';
import { useSearchViewModel } from '../../viewmodels/useSearchViewModel';
import { PlayerCard } from '../PlayerCard';
import GenericCard from '../components/GenericCard'; 

export default function SearchResults() {
  const { searchTerm } = useOutletContext();
  const { players, teams, nations, loading } = useSearchViewModel(searchTerm);
  const navigate = useNavigate();

  if (loading) return <div className="loading">Ricerca in corso...</div>;

  if (!searchTerm || searchTerm.trim().length < 3) {
    return (
      <div style={{textAlign: 'center', padding: '3rem'}}>
        <h2 className="pageTitle">Ricerca Globale</h2>
        <p>Inserisci almeno 3 caratteri (es. "Italy") per cercare nazioni, squadre o giocatori...</p>
      </div>
    );
  }

  const hasResults = players.length > 0 || teams.length > 0 || nations.length > 0;

  // Helper per navigazione con contesto
const goToPlayerDetail = (player) => {
    navigate(`/giocatori/${player.id}`, { 
      state: { 
        player: player, 
        contextList: players,
        from: '/ricerca' 
      } 
    });
  };

  return (
    <div>
      <h2 className="pageTitle">Risultati per "{searchTerm}"</h2>
      
      {!hasResults && (
        <p style={{textAlign: 'center', padding: '2rem', color: '#666'}}>Nessun risultato trovato.</p>
      )}

      {/* SEZIONE NAZIONI */}
      {nations.length > 0 && (
        <div style={{marginBottom: '3rem'}}>
          <h3 style={{color: '#003366', marginLeft: '1rem', borderBottom: '2px solid #00ff88', display: 'inline-block'}}>
            🏳️ Nazioni ({nations.length})
          </h3>
          <div className="grid">
            {nations.map((nation) => (
              <GenericCard 
                key={nation.name}
                title={nation.name}
                image={nation.flag}
                subtitle="Vedi Campionati"
                onClick={() => navigate(`/nazioni/${nation.name}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* SEZIONE SQUADRE */}
      {teams.length > 0 && (
        <div style={{marginBottom: '3rem'}}>
          <h3 style={{color: '#003366', marginLeft: '1rem', borderBottom: '2px solid #ff6b35', display: 'inline-block'}}>
            🛡️ Squadre & Nazionali ({teams.length})
          </h3>
          <div className="grid">
            {teams.map((team) => (
              <GenericCard 
                key={team.id}
                title={team.name}
                image={team.logo}
                subtitle={team.isNational ? "⭐ Nazionale Ufficiale" : `Club: ${team.country}`}
                onClick={() => navigate(`/squadre/${team.id}/giocatori`)}
              >
                {team.isNational && (
                  <div style={{position: 'absolute', top: '10px', right: '10px', fontSize: '1.2rem'}}>🏛️</div>
                )}
              </GenericCard>
            ))}
          </div>
        </div>
      )}

      {/* SEZIONE GIOCATORI */}
      {players.length > 0 && (
        <div>
          <h3 style={{color: '#003366', marginLeft: '1rem', borderBottom: '2px solid #003366', display: 'inline-block'}}>
            ⚽ Giocatori ({players.length})
          </h3>
          <div className="grid">
            {players.map(player => (
              // GenericCard modificata o il div diretto per poter usare l'onClick custom
              <div key={player.id} onClick={() => goToPlayerDetail(player)} style={{cursor: 'pointer'}}>
                 <PlayerCard player={player} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}