/**
 * VIEW: PlayerCard.jsx
 * Componente funzionale per la visualizzazione a card del singolo calciatore
 * Riceve i dati tramite Props in sola lettura
 */
import { Link } from 'react-router-dom';
import styles from './components/PlayerCard.module.css'; // Utilizzo di CSS Modules per lo scope locale 

export function PlayerCard({ player }) {
  return (
    <div className={styles.card}>
      <img src={player.photo} alt={player.name} className={styles.photo} />
      <h3>{player.name}</h3>
      <p>Rating: {player.rating}</p>
      {/* Navigazione alla rotta dinamica di dettaglio*/}
      <Link to={`/player/${player.id}`} className={styles.btn}>
        Dettaglio
      </Link>
    </div>
  );
}