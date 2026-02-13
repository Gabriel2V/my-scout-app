/**
 * @component Home
 * @description Landing Page dell'applicazione.
 * Funzionalità:
 * - Fornisce il punto d'ingresso principale alla navigazione.
 * - Presenta tre macro-sezioni (Nazioni, Nazionali, Top Players) tramite card interattive.
 * - Utilizza `useNavigate` per indirizzare l'utente alle rotte specifiche.
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
        {/* Navigazione gerarchica per Nazione -> Campionato */}
        <div className={cardStyles.card} onClick={() => navigate('/nazioni')}>
          <span>🌍</span>
          <h3>Leghe per Nazione</h3>
        </div>

        {/* Lista diretta Squadre Nazionali */}
        <div className={cardStyles.card} onClick={() => navigate('/nazionali')}>
          <span>🚩</span>
          <h3>Squadre Nazionali</h3>
        </div>

        {/* Lista globale Top Players */}
        <div className={cardStyles.card} onClick={() => navigate('/giocatori')}>
          <span>⭐</span>
          <h3>Top Player Mondiali</h3>
        </div>
      </div>
    </div>
  );
}