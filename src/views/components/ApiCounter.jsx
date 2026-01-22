import { useState, useEffect } from 'react';
import PlayerService from '../../services/PlayerService';
import styles from '../../styles/ApiCounter.module.css';

export default function ApiCounter() {
  const [usage, setUsage] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Aggiorna il contatore ogni 2 secondi
    const updateUsage = () => {
      const data = PlayerService.getApiUsage();
      setUsage(data);
    };

    updateUsage();
    const interval = setInterval(updateUsage, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!usage) return null;

  // Determina il colore in base alla percentuale
  const getColor = () => {
    if (usage.percentage >= 100) return '#ef4444'; // Rosso
    if (usage.percentage >= 80) return '#f59e0b';  // Arancione
    if (usage.percentage >= 50) return '#eab308';  // Giallo
    return '#10b981'; // Verde
  };

  const color = getColor();

  return (
    <div 
      className={styles.container}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Badge compatto */}
      {!isExpanded && (
        <div 
          className={styles.badge}
          style={{ backgroundColor: color }}
        >
          <span>📊</span>
          <span>{usage.used}/{usage.limit}</span>
        </div>
      )}

      {/* Card espansa */}
      {isExpanded && (
        <div 
          className={styles.card}
          style={{ borderColor: color }}
        >
          <div className={styles.header}>
            <h4 className={styles.title}>API Usage</h4>
            <span className={styles.icon}>📊</span>
          </div>

          {/* Barra di progresso */}
          <div className={styles.progressTrack}>
            <div 
              className={styles.progressFill}
              style={{
                width: `${usage.percentage}%`,
                backgroundColor: color
              }} 
            />
          </div>

          {/* Statistiche */}
          <div className={styles.statsContainer}>
            <div className={styles.statRow}>
              <span>Usate:</span>
              <strong style={{ color }}>{usage.used}</strong>
            </div>
            
            <div className={styles.statRow}>
              <span>Rimanenti:</span>
              <strong style={{ 
                color: usage.remaining > 20 ? '#10b981' : '#ef4444' 
              }}>
                {usage.remaining}
              </strong>
            </div>
            
            <div className={styles.statRow}>
              <span>Limite:</span>
              <strong>{usage.limit}</strong>
            </div>

            <div 
              className={styles.percentageRow}
              style={{ color }}
            >
              {usage.percentage}%
            </div>
          </div>

          {/* Alert */}
          {usage.percentage >= 80 && (
            <div className={`${styles.alertBox} ${
              usage.percentage >= 100 ? styles.alertCritical : styles.alertWarning
            }`}>
              {usage.percentage >= 100 
                ? 'Limite raggiunto! Usa la cache.'
                : 'Limite quasi raggiunto!'
              }
            </div>
          )}

          <div className={styles.resetInfo}>
            Reset: mezzanotte
          </div>
        </div>
      )}
    </div>
  );
}