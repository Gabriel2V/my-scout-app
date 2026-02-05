/** 
 * @component SearchResults 
 * @description Pagina dei risultati della ricerca globale. 
*/
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSearchViewModel } from '../../viewmodels/useSearchViewModel';
import { PlayerCard } from '../PlayerCard';
import GenericCard from '../components/GenericCard'; 
import styles from '../../styles/SearchResults.module.css';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('q') || ''; // Legge dalla query string ?q=...
  const { players, teams, nations, loading } = useSearchViewModel(searchTerm);
  const navigate = useNavigate();

  if (loading) return <div className="loading">Ricerca in corso...</div>;

  if (!searchTerm || searchTerm.trim().length < 3) {
    return (
      <div style={{textAlign: 'center', padding: '3rem'}}>
        <h2 className="pageTitle">Ricerca Globale</h2>
        <p>Inserisci almeno 3 caratteri per cercare nazioni, squadre o giocatori...</p>
      </div>
    );
  }

  const hasResults = players.length > 0 || teams.length > 0 || nations.length > 0;

  return (
    <div>
      <h2 className="pageTitle">Risultati per "{searchTerm}"</h2>
      
      {!hasResults && <div className={styles.noResults}><p>Nessun risultato trovato.</p></div>}

      {nations.length > 0 && (
        <div className={styles.section}>
          <h3 className={`${styles.sectionTitle} ${styles.nationsBorder}`}>🏳️ Nazioni ({nations.length})</h3>
          <div className="grid">
            {nations.map((n) => (
              <GenericCard key={n.name} title={n.name} image={n.flag} subtitle="Vedi Campionati" 
                onClick={() => navigate(`/nazioni/${n.name}`)} />
            ))}
          </div>
        </div>
      )}

      {teams.length > 0 && (
        <div className={styles.section}>
          <h3 className={`${styles.sectionTitle} ${styles.teamsBorder}`}>🛡️ Squadre ({teams.length})</h3>
          <div className="grid">
            {teams.map((t) => (
              <GenericCard key={t.id} title={t.name} image={t.logo} 
                subtitle={t.isNational ? "⭐ Nazionale" : `Club: ${t.country}`}
                onClick={() => navigate(`/squadre/${t.id}/giocatori`)} />
            ))}
          </div>
        </div>
      )}

      {players.length > 0 && (
        <div className={styles.section}>
          <h3 className={`${styles.sectionTitle} ${styles.playersBorder}`}>⚽ Giocatori ({players.length})</h3>
          <div className="grid">
            {players.map(p => (
              <div key={p.id} className={styles.playerWrapper} onClick={() => navigate(`/giocatori/${p.id}`)}>
                 <PlayerCard player={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}