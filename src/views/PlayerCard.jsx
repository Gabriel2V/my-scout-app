/**
 * @component PlayerCard
 * @description Componente di presentazione dedicato alla visualizzazione sintetica di un calciatore.
 * Utilizzato principalmente nelle liste dei risultati di ricerca globale.
 * Interazione: Fornisce un `Link` diretto alla vista di dettaglio, passando l'oggetto `player` nello state
 * per evitare chiamate API ridondanti al caricamento del dettaglio.
 * @param {Object} props.player - Oggetto Modello Player (istanza di models/Player).
 */
import { Link } from 'react-router-dom';
import styles from '../styles/PlayerCard.module.css';

export function PlayerCard({ player }) {
  return (
    <div className={styles.card}>
      <img src={player.photo} alt={player.name} className={styles.photo} />
      <h3>{player.name}</h3>
      <p>Rating: {player.rating}</p>
      
      {/* Passaggio stato via Router per navigazione istantanea */}
      <Link 
        to={`/giocatori/${player.id}`} 
        state={{ player }} 
        className={styles.btn}
      >
        Dettaglio
      </Link>
    </div>
  );
}