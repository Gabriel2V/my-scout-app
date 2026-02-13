/**
 * @component ApiCounter
 * @description Widget fluttuante che monitora il consumo delle chiamate API in tempo reale.
 * Funzionalità:
 * - Visualizza un badge compatto con il conteggio corrente.
 * - Si espande al click per mostrare statistiche dettagliate e barre di progresso.
 * - Cambia colore dinamicamente (Verde -> Giallo -> Rosso) in base alla percentuale di utilizzo.
 * - Utilizza `useApiUsageViewModel` per la sincronizzazione dei dati.
 */
import { useState } from 'react';
import { useApiUsageViewModel } from '../../viewmodels/useApiUsageViewModel';
import styles from '../../styles/ApiCounter.module.css';

export default function ApiCounter() {
  /**
   *  Dati di utilizzo API dal ViewModel.
   * @type {Object} 
   * Chiamate effettuate.
   * @property {number} usage.used
   * Limite giornaliero.
   * @property {number} usage.limit
   * Percentuale di consumo.
   * @property {number} usage.percentage 
   */
  const { usage } = useApiUsageViewModel(2000); // Polling ogni 2 secondi
  
  /**
   * Stato di espansione del widget 
   * @type {Array} 
   */
  const [isExpanded, setIsExpanded] = useState(false);

  // Se i dati non sono ancora pronti, non renderizzare nulla.
  if (!usage) return null;

  /**
   * Determina il colore di stato in base alla percentuale di utilizzo.
   * @returns {string} Codice colore esadecimale (es. #10b981).
   */
  const getColor = () => {
    if (usage.percentage >= 100) return '#ef4444'; // Rosso (Critico)
    if (usage.percentage >= 80) return '#f59e0b';  // Arancione (Warning)
    if (usage.percentage >= 50) return '#eab308'; // Giallo (Attenzione)
    return '#10b981'; // Verde (OK)
  };

  const color = getColor();

  return (
    <div 
      className={styles.container}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Stato Minimized: Solo Badge */}
      {!isExpanded && (
        <div className={styles.badge} style={{ backgroundColor: color }}>
          <span>📊</span>
          <span>{usage.used}/{usage.limit}</span>
        </div>
      )}

      {/* Stato Expanded: Pannello Dettagli */}
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