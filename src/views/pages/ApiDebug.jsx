/**
 * @component ApiDebug
 * @description Dashboard tecnica per il monitoraggio delle chiamate API.
 * Features:
 * - Visualizza le statistiche di utilizzo (usate/rimanenti) in tempo reale.
 * - Mostra lo stato della configurazione (Endpoint, API Key).
 * - Fornisce strumenti di amministrazione per resettare il contatore locale o pulire la cache.
 * * Utilizza `useApiUsageViewModel` per la logica di business.
 */
import React from 'react';
import { useApiUsageViewModel } from '../../viewmodels/useApiUsageViewModel';
import styles from '../../styles/ApiDebug.module.css';

export default function ApiDebug() {
  // Refresh rate (1000ms) per monitoraggio real-time
  const { usage, config, resetCounter, clearCache } = useApiUsageViewModel(1000);

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

  return (
    <div className={styles.container}>
      <h2 className="pageTitle">🛠️ API Monitor & Debug</h2>
      
      {/* Pannello Configurazione */}
      <div className={styles.debugCard} style={{marginBottom: '2rem', borderLeft: '4px solid var(--primary)'}}>
        <h3 className={styles.cardTitle}>Configurazione di Sistema</h3>
        <div className={styles.infoBox}>
          <p><strong>Endpoint Base:</strong> <code>{config.baseUrl}</code></p>
          <p><strong>Stato:</strong> 
            <span style={{color: config.isConfigured ? '#10b981' : '#ef4444', marginLeft: '5px'}}>
              {config.isConfigured ? '● Collegato' : '● Errore Configurazione'}
            </span>
          </p>
          <p><strong>Limite giornaliero di chiamate:</strong> 100</p>
          <p><strong>Limite di chiamate al minuto:</strong> 10</p>
        </div>
      </div>

      {/* Pannello Statistiche */}
      <div className={styles.debugCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>API Usage Monitor</h3>
          <span className={styles.statusIcon}>
            {usage.percentage >= 80 ? '⚠️' : '✅'}
          </span>
        </div>

        <div className={styles.statsGrid}>
          <div className={`${styles.statBox} ${styles.statBoxGreen}`}>
            <div className={styles.statValue}>{usage.used}</div>
            <div className={styles.statLabel}>Usate</div>
          </div>
          <div className={`${styles.statBox} ${styles.statBoxYellow}`}>
            <div className={styles.statValue}>{usage.remaining}</div>
            <div className={styles.statLabel}>Rimanenti</div>
          </div>
          <div className={`${styles.statBox} ${styles.statBoxBlue}`}>
            <div className={styles.statValue}>{usage.percentage}%</div>
            <div className={styles.statLabel}>Utilizzo</div>
          </div>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressTrack}>
            <div 
              className={styles.progressFill}
              style={{
                width: `${usage.percentage}%`,
                background: usage.percentage >= 80 ? '#f59e0b' : '#10b981'
              }}
            >
              {usage.percentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Controlli Manuali */}
      <div className={styles.controlsGrid}>
        <button onClick={handleClearCache} className={`${styles.btn} ${styles.btnClear}`}>
          🗑️ Pulisci Cache
        </button>
      </div>
    </div>
  );
}