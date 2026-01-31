/**
 * PAGE: ApiDebug.jsx
 * Dashboard di servizio per il monitoraggio delle chiamate API
 * Permette di visualizzare il consumo giornaliero e forzare la pulizia della cache o dei contatori
 */
import { useState, useEffect } from 'react';
import PlayerService from '../../services/PlayerService';
import styles from '../../styles/ApiDebug.module.css';

export default function ApiDebug() {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    const updateUsage = () => {
      setUsage(PlayerService.getApiUsage());
    };
    
    updateUsage();
    const interval = setInterval(updateUsage, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    if (window.confirm('Vuoi davvero resettare il contatore API?')) {
      PlayerService.resetApiCounter();
      setUsage(PlayerService.getApiUsage());
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Vuoi cancellare tutta la cache dei giocatori?')) {
      // Rimuovi tutte le chiavi che iniziano con "players_"
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('players_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      alert(`Cache pulita: ${keysToRemove.length} chiavi rimosse`);
    }
  };

  if (!usage) return <div className="loading">Caricamento...</div>;

  const getStatusEmoji = () => {
    if (usage.percentage >= 100) return '🚫';
    if (usage.percentage >= 80) return '⚠️';
    if (usage.percentage >= 50) return '⚡';
    return '✅';
  };

  // Determina colore barra progresso dinamicamente
  const getProgressColor = () => {
    if (usage.percentage >= 100) return '#ef4444';
    if (usage.percentage >= 80) return '#f59e0b';
    if (usage.percentage >= 50) return '#eab308';
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

        {/* Statistiche Principali */}
        <div className={styles.statsGrid}>
          {/* Box Verde */}
          <div className={`${styles.statBox} ${styles.statBoxGreen}`}>
            <div className={`${styles.statValue} ${styles.textGreen}`}>
              {usage.used}
            </div>
            <div className={`${styles.statLabel} ${styles.textDarkGreen}`}>Chiamate Usate</div>
          </div>

          {/* Box Giallo */}
          <div className={`${styles.statBox} ${styles.statBoxYellow}`}>
            <div className={`${styles.statValue} ${styles.textYellow}`}>
              {usage.remaining}
            </div>
            <div className={`${styles.statLabel} ${styles.textDarkYellow}`}>Rimanenti</div>
          </div>

          {/* Box Blu */}
          <div className={`${styles.statBox} ${styles.statBoxBlue}`}>
            <div className={`${styles.statValue} ${styles.textBlue}`}>
              {usage.percentage}%
            </div>
            <div className={`${styles.statLabel} ${styles.textDarkBlue}`}>Utilizzo</div>
          </div>
        </div>

        {/* Barra di Progresso */}
        <div className={styles.progressSection}>
          <div className={styles.progressInfo}>
            <span>Progresso giornaliero</span>
            <span>{usage.used} / {usage.limit}</span>
          </div>
          <div className={styles.progressTrack}>
            <div 
              className={styles.progressFill}
              style={{
                width: `${usage.percentage}%`,
                background: getProgressColor()
              }}
            >
              {usage.percentage > 10 && `${usage.percentage}%`}
            </div>
          </div>
        </div>

        {/* Info Data */}
        <div className={styles.infoBox}>
          <div><strong>Data corrente:</strong> {usage.date}</div>
          <div><strong>Reset automatico:</strong> Mezzanotte (00:00)</div>
          <div><strong>Limite giornaliero:</strong> {usage.limit} chiamate</div>
          <div><strong>Limite di chiamate per minuto:</strong> 10 chiamate/minuto</div>
        </div>
      </div>

      {/* Pulsanti di Controllo */}
      <div className={styles.controlsGrid}>
        <button
          onClick={handleReset}
          className={`${styles.btn} ${styles.btnReset}`}
        >
          🔄 Reset Contatore
        </button>

        <button
          onClick={handleClearCache}
          className={`${styles.btn} ${styles.btnClear}`}
        >
          🗑️ Pulisci Cache
        </button>
      </div>

      {/* Alert */}
      {usage.percentage >= 90 && (
        <div 
          className={styles.alertBox}
          style={{
            background: usage.percentage >= 100 ? '#fee2e2' : '#fef3c7',
            borderLeft: `4px solid ${usage.percentage >= 100 ? '#ef4444' : '#f59e0b'}`,
          }}
        >
          <div 
            className={styles.alertTitle}
            style={{ color: usage.percentage >= 100 ? '#991b1b' : '#92400e' }}
          >
            {usage.percentage >= 100 ? '🚫 Limite Raggiunto!' : '⚠️ Attenzione!'}
          </div>
          <div 
            className={styles.alertMessage}
            style={{ color: usage.percentage >= 100 ? '#7f1d1d' : '#78350f' }}
          >
            {usage.percentage >= 100 
              ? 'Hai esaurito tutte le chiamate API per oggi. I dati vengono ora caricati solo dalla cache.'
              : `Hai usato ${usage.percentage}% del limite giornaliero. Usa con parsimonia le chiamate rimanenti.`
            }
          </div>
        </div>
      )}
    </div>
  );
}