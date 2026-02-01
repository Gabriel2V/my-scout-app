/**
 * COMPONENT: ApiCounter.jsx
 * Widget flottante che mostra in tempo reale l'utilizzo delle chiamate API
 * Fornisce feedback visivo (colori/alert) all'avvicinarsi del limite giornaliero
 */
import { useState } from 'react';
import { useApiUsageViewModel } from '../../viewmodels/useApiUsageViewModel';
import styles from '../../styles/ApiCounter.module.css';

export default function ApiCounter() {
  // ViewModel gestisce la logica. View gestisce solo l'apertura/chiusura del widget.
  const { usage } = useApiUsageViewModel(2000); 
  const [isExpanded, setIsExpanded] = useState(false);

  if (!usage) return null;

  const getColor = () => {
    if (usage.percentage >= 100) return '#ef4444'; 
    if (usage.percentage >= 80) return '#f59e0b';  
    if (usage.percentage >= 50) return '#eab308'; 
    return '#10b981'; 
  };

  const color = getColor();

  return (
    <div 
      className={styles.container}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {!isExpanded && (
        <div className={styles.badge} style={{ backgroundColor: color }}>
          <span>📊</span>
          <span>{usage.used}/{usage.limit}</span>
        </div>
      )}

      {isExpanded && (
        <div className={styles.card} style={{ borderColor: color }}>
          <div className={styles.header}>
            <h4 className={styles.title}>API Usage</h4>
            <span className={styles.icon}>📊</span>
          </div>

          <div className={styles.progressTrack}>
            <div 
              className={styles.progressFill}
              style={{ width: `${usage.percentage}%`, backgroundColor: color }} 
            />
          </div>

          <div className={styles.statsContainer}>
            <div className={styles.statRow}>
              <span>Usate:</span>
              <strong style={{ color }}>{usage.used}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Rimanenti:</span>
              <strong style={{ color: usage.remaining > 20 ? '#10b981' : '#ef4444' }}>
                {usage.remaining}
              </strong>
            </div>
          </div>

          {usage.percentage >= 80 && (
            <div className={`${styles.alertBox} ${usage.percentage >= 100 ? styles.alertCritical : styles.alertWarning}`}>
              {usage.percentage >= 100 ? 'Limite raggiunto!' : 'Limite quasi raggiunto!'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}