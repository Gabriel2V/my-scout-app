/**
 * VIEW: PlayerCard.jsx
 * Componente funzionale per la visualizzazione a card del singolo calciatore
 * Riceve i dati tramite Props in sola lettura
 */
import { Link } from 'react-router-dom';
import styles from '../styles/PlayerCard.module.css';

export function PlayerCard({ player }) {
  return (
    <div className={styles.card}>
      <img src={player.photo} alt={player.name} className={styles.photo} />
      <h3>{player.name}</h3>
      <p>Rating: {player.rating}</p>
      {/* 1. Corretto il link: punta a /giocatori/ invece di /player/
         2. Aggiunto state={{ player }}: passa i dati senza nuove chiamate
      */}
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