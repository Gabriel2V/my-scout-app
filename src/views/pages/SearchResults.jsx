import { useOutletContext, useNavigate } from 'react-router-dom';
import { useSearchViewModel } from '../../viewmodels/useSearchViewModel';
import { PlayerCard } from '../PlayerCard';
import styles from '../../styles/Card.module.css';

export default function SearchResults() {
  const { searchTerm } = useOutletContext();
  const { players, teams, loading } = useSearchViewModel(searchTerm);
  const navigate = useNavigate();

  if (loading) return <div className="loading">Ricerca in corso...</div>;

  if (!searchTerm || searchTerm.trim().length < 3) {
    return (
      <div style={{textAlign: 'center', padding: '3rem'}}>
        <h2 className="pageTitle">Ricerca Globale</h2>
        <p>Inserisci almeno 3 caratteri per cercare...</p>
      </div>
    );
  }

  const hasResults = players.length > 0 || teams.length > 0;

  return (
    <div>
      <h2 className="pageTitle">Risultati per "{searchTerm}"</h2>
      
      {!hasResults && (
        <p style={{textAlign: 'center', padding: '2rem', color: '#666'}}>
          Nessun risultato trovato. Prova con un altro nome.
        </p>
      )}

      {/* SEZIONE SQUADRE */}
      {teams.length > 0 && (
        <div style={{marginBottom: '3rem'}}>
          <h3 style={{color: '#003366', marginLeft: '1rem', borderBottom: '2px solid #ff6b35', display: 'inline-block'}}>
            Squadre ({teams.length})
          </h3>
          <div className="grid">
            {teams.map((team) => (
              <div 
                key={team.id} 
                className={styles.card}
                onClick={() => navigate(`/squadre/${team.id}/giocatori`)}
              >
                <img src={team.logo} alt={team.name} style={{width: '60px', height: '60px', objectFit: 'contain'}} />
                <h3>{team.name}</h3>
                <p style={{fontSize: '0.8rem', color: '#666'}}>{team.country}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEZIONE GIOCATORI */}
      {players.length > 0 && (
        <div>
          <h3 style={{color: '#003366', marginLeft: '1rem', borderBottom: '2px solid #ff6b35', display: 'inline-block'}}>
            Giocatori ({players.length})
          </h3>
          <div className="grid">
            {players.map(player => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

}