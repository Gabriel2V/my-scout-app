/**
 * PAGE: ApiDebug.jsx
 * Dashboard di servizio per il monitoraggio delle chiamate API
 * Permette di visualizzare il consumo giornaliero e forzare la pulizia della cache o dei contatori
 */
import { useApiUsageViewModel } from '../../viewmodels/useApiUsageViewModel';
import styles from '../../styles/ApiDebug.module.css';

export default function ApiDebug() {
  const { usage, resetCounter, clearCache } = useApiUsageViewModel(1000);

  const handleReset = () => {
    if (window.confirm('Vuoi davvero resettare il contatore API?')) {
      resetCounter();
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Vuoi cancellare tutta la cache dei giocatori?')) {
      const count = clearCache();
      alert(`Cache pulita: ${count} chiavi rimosse`);
    }
  };

  if (!usage) return <div className="loading">Caricamento monitoraggio...</div>;

  const getStatusEmoji = () => {
    if (usage.percentage >= 100) return '🚫';
    if (usage.percentage >= 80) return '⚠️';
    return '✅';
  };

  const getProgressColor = () => {
    if (usage.percentage >= 100) return '#ef4444';
    if (usage.percentage >= 80) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className={styles.container}>
      <h2 className="pageTitle">🛠️ API Debug Dashboard</h2>

      <div className={styles.debugCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>API Usage Monitor</h3>
          <span className={styles.statusIcon}>{getStatusEmoji()}</span>
        </div>

        <div className={styles.statsGrid}>
          <div className={`${styles.statBox} ${styles.statBoxGreen}`}>
            <div className={`${styles.statValue} ${styles.textGreen}`}>{usage.used}</div>
            <div className={styles.statLabel}>Chiamate Usate</div>
          </div>
          <div className={`${styles.statBox} ${styles.statBoxYellow}`}>
            <div className={`${styles.statValue} ${styles.textYellow}`}>{usage.remaining}</div>
            <div className={styles.statLabel}>Rimanenti</div>
          </div>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressTrack}>
            <div 
              className={styles.progressFill}
              style={{ width: `${usage.percentage}%`, background: getProgressColor() }}
            >
              {usage.percentage}%
            </div>
          </div>
        </div>
      </div>

      <div className={styles.controlsGrid}>
        <button onClick={handleReset} className={`${styles.btn} ${styles.btnReset}`}>
          🔄 Reset Contatore
        </button>
        <button onClick={handleClearCache} className={`${styles.btn} ${styles.btnClear}`}>
          🗑️ Pulisci Cache
        </button>
      </div>
    </div>
  );
}