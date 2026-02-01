/**
 * VIEW: PlayerDetailView.jsx
 * Pagina di dettaglio del singolo calciatore
 * Mostra statistiche approfondite e gestisce la navigazione "precedente/successivo" mantenendo il contesto della lista di origine
 */
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { usePlayerDetailViewModel } from '../viewmodels/usePlayerDetailViewModel';
import styles from '../styles/PlayerDetailView.module.css';

export default function PlayerDetailView() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialPlayer = location.state?.player || null;
  const contextList = location.state?.contextList || []; 
  const returnPath = location.state?.from || '/'; 

  // FIX: Chiamata al ViewModel SPOSTATA QUI, prima dell'utilizzo di 'player'
  const { player, loading, error } = usePlayerDetailViewModel(id, initialPlayer);

  // Logica Navigazione Prev/Next (ora 'player' è definito)
  const currentIndex = player ? contextList.findIndex(p => p.id === player.id) : -1;
  const prevPlayer = currentIndex > 0 ? contextList[currentIndex - 1] : null;
  const nextPlayer = currentIndex !== -1 && currentIndex < contextList.length - 1 ? contextList[currentIndex + 1] : null;

  const goToPlayer = (targetPlayer) => {
    navigate(`/giocatori/${targetPlayer.id}`, { 
      state: { 
        player: targetPlayer, 
        contextList: contextList,
        from: returnPath 
      } 
    });
  };

  if (loading) return <div className={styles.loading}>Caricamento dettagli...</div>;

  if (error) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', color: '#333' }}>
        <h2>{error}</h2>
        <button onClick={() => navigate(returnPath)} className={styles.backBtn}>Torna indietro</button>
      </div>
    );
  }

  if (!player) return null;

  const formattedRating = player.rating && player.rating !== "N/A" 
    ? parseFloat(player.rating).toFixed(1) 
    : "N/A";

  return (
    <div className={styles.container}>
      {/* HEADER NAVIGAZIONE */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <button 
          onClick={() => navigate(returnPath)} 
          className={styles.backBtn}
        >
          ← Torna alla lista
        </button>
      </div>
      
      {/* FRECCE DI NAVIGAZIONE */}
      {prevPlayer && (
        <button 
          className={`${styles.navArrow} ${styles.navArrowLeft}`}
          onClick={() => goToPlayer(prevPlayer)}
          title={`Vai a ${prevPlayer.name}`}
        >
          ‹
        </button>
      )}

      {nextPlayer && (
        <button 
          className={`${styles.navArrow} ${styles.navArrowRight}`}
          onClick={() => goToPlayer(nextPlayer)}
          title={`Vai a ${nextPlayer.name}`}
        >
          ›
        </button>
      )}

      {/* CARD DETTAGLIO */}
      <div className={styles.detailCard}>
        <div className={styles.header}>
          <img src={player.photo} alt={player.name} className={styles.mainPhoto} />
          <h1>{player.name}</h1>
        </div>
        
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <strong>Squadra</strong> <span>{player.team}</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Nazionalità</strong> <span>{player.nationality}</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Età</strong> <span>{player.age}</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Rating</strong> 
            <span className={styles.rating}>{formattedRating}</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Gol Stagionali</strong> <span>{player.goals}</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Ruolo</strong> <span>{player.position}</span>
          </div>
        </div>
      </div>
    </div>
  );
}