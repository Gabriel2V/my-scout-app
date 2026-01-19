/**
 * VIEW: PlayerDetailView.jsx
 * Visualizza i dettagli completi del singolo calciatore.
 * Utilizza useParams per recuperare l'ID dall'URL
 */
import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { usePlayersViewModel } from '../viewmodels/usePlayersViewModel';
import styles from './components/PlayerDetailView.module.css'; // CSS Modules 

export function PlayerDetailView() {
  const { id } = useParams(); // Recupera l'ID dalla rotta dinamica 
  const { players, loading } = usePlayersViewModel();

  if (loading) return <div className={styles.loading}>Caricamento dettagli...</div>;

  // Ricerca del calciatore nel dataset tramite ID
  const player = players.find(p => p.id === parseInt(id));

  // Validazione: se il calciatore non esiste, reindirizza alla home (404) 
  if (!player) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backBtn}>← Torna alla Lista</Link>
      
      <div className={styles.detailCard}>
        <div className={styles.header}>
          <img src={player.photo} alt={player.name} className={styles.mainPhoto} />
          <h1>{player.name}</h1>
        </div>
        
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <strong>Squadra:</strong> <span>{player.team}</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Nazionalità:</strong> <span>{player.nationality}</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Età:</strong> <span>{player.age}</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Rating:</strong> <span className={styles.rating}>{player.rating}</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Gol Stagionali:</strong> <span>{player.goals}</span>
          </div>
        </div>
      </div>
    </div>
  );
}