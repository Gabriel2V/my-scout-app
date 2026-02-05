/**
 * @component PlayerCard
 * @description Componente specializzato per la visualizzazione sintetica di un calciatore.
 * Mostra l'avatar, il ruolo, la valutazione e i gol, fornendo un punto d'accesso rapido al dettaglio.
 */
import { Link } from 'react-router-dom';
import styles from '../styles/PlayerCard.module.css';

export function PlayerCard({ player }) {
  return (
    <div className={styles.card}>
      <img src={player.photo} alt={player.name} className={styles.photo} />
      <h3>{player.name}</h3>
      <p>Rating: {player.rating}</p>
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