/**
 * @component SearchResults 
 * @description Vista per i risultati della ricerca globale.
 * Aggrega e visualizza tre categorie di risultati: Nazioni, Squadre e Giocatori.
 * Utilizza la query string `?q=` (e opzionalmente `&p=`) per mantenere lo stato ricaricabile.
 */
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSearchViewModel } from '../../viewmodels/useSearchViewModel';
import { PlayerCard } from '../PlayerCard';
import GenericCard from '../components/GenericCard'; 
import styles from '../../styles/SearchResults.module.css';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('q') || ''; 
  const playerTerm = searchParams.get('p') || ''; 
  
  const { players, teams, nations, loading } = useSearchViewModel(searchTerm, playerTerm);
  const navigate = useNavigate();

  if (loading) return <div className="loading">Ricerca in corso...</div>;

  // Empty State preventivo per ricerche troppo brevi
  if (!searchTerm || searchTerm.trim().length < 3) {
    return (
      <div style={{textAlign: 'center', padding: '3rem'}}>
        <h2 className="pageTitle">Ricerca Globale</h2>
        <p>Inserisci almeno 3 caratteri per cercare nazioni, squadre o giocatori...</p>
      </div>
    );
  }

  // Determina se stiamo effettuando una sub-ricerca specifica per giocatore
  const isPlayerSearch = playerTerm.trim().length > 0;

  // Ricalcola se ci sono risultati validi da mostrare in base al contesto
  const hasResults = isPlayerSearch 
    ? players.length > 0 
    : players.length > 0 || teams.length > 0 || nations.length > 0;

  return (
    <div>
      <h2 className="pageTitle">
        Risultati per "{searchTerm}" {isPlayerSearch ? ` > "${playerTerm}"` : ''}
      </h2>
      
      {!hasResults && <div className={styles.noResults}><p>Nessun risultato trovato.</p></div>}

      {/* Sezione Nazioni */}
      {!isPlayerSearch && nations.length > 0 && (
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

      {/* Sezione Squadre */}
      {!isPlayerSearch && teams.length > 0 && (
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

      {/* Sezione Giocatori*/}
      {players.length > 0 && (
        <div className={styles.section}>
          <h3 className={`${styles.sectionTitle} ${styles.playersBorder}`}>⚽ Giocatori ({players.length})</h3>
          <div className="grid">
            {players.map(p => (
              <div 
                key={p.id} 
                className={styles.playerWrapper} 
                onClick={() => navigate(`/giocatori/${p.id}`, { state: { player: p, from: '/ricerca' } })}
              >
                 <PlayerCard player={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}