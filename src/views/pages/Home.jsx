/**
 * PAGE: Home.jsx
 * Pagina iniziale dell'applicazione (Dashboard)
 * Offre un accesso rapido alle sezioni principali: Nazioni e Giocatori Mondiali
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
        <div className={cardStyles.card} onClick={() => navigate('/nazioni')}>
          <span>🌍</span>
          <h3>Nazioni</h3>
        </div>
        <div className={cardStyles.card} onClick={() => navigate('/giocatori')}>
          <span>⭐</span>
          <h3>Giocatori Mondiali</h3>
        </div>
      </div>
    </div>
  );
}