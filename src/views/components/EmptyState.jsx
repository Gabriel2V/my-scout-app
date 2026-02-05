/** 
 * @component EmptyState 
 * @description Visualizzazione di fallback quando non ci sono dati o risultati. 
*/
import React from 'react';

export default function EmptyState({ message, icon = "📂" }) {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      textAlign: 'center',
      color: '#6b7280', // Grigio neutro
      backgroundColor: 'var(--card-bg)',
      borderRadius: 'var(--radius-md)',
      marginTop: '2rem',
      border: '1px dashed #d1d5db'
    },
    icon: {
      fontSize: '3rem',
      marginBottom: '1rem',
      opacity: 0.8
    },
    text: {
      fontSize: '1.1rem',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.icon}>{icon}</div>
      <p style={styles.text}>{message || "Nessun dato disponibile."}</p>
    </div>
  );
}