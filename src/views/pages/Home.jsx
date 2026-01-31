/**
 * PAGE: Home.jsx
 * Pagina iniziale dell'applicazione (Dashboard)
 * Offre un accesso rapido alle sezioni principali: Campionati, Nazionali e Giocatori Mondiali
 */
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/HomePage.module.css';
import cardStyles from '../../styles/Card.module.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.hero}>
      <h1>Benvenuto in My Scout App</h1>
      
      <div className={styles.dashboard}>
        {/* CARD 1: NAZIONI */}
        <div className={cardStyles.card} onClick={() => navigate('/nazioni')}>
          <span>🌍</span>
          <h3>Leghe per Nazione</h3>
        </div>

        {/* CARD 2: NAZIONALI */}
        <div className={cardStyles.card} onClick={() => navigate('/nazionali')}>
          <span>🚩</span>
          <h3>Squadre Nazionali</h3>
        </div>

        {/* CARD 3: GIOCATORI */}
        <div className={cardStyles.card} onClick={() => navigate('/giocatori')}>
          <span>⭐</span>
          <h3>Top Player Mondiali</h3>
        </div>
      </div>
    </div>
  );
}