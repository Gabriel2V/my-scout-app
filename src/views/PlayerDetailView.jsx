/**
 * @component PlayerDetailView
 * @description Vista di dettaglio del singolo calciatore.
 * Features:
 * - Contextual Navigation: Permette di scorrere tra i giocatori (Prev/Next) mantenendo il filtro della lista precedente.
 * - Deep Linking: Gestisce l'accesso diretto via URL o la navigazione dalla lista.
 * - Cross-Navigation: Permette di saltare alla squadra o alla ricerca nazione cliccando sui metadati.
 */
import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { usePlayerDetailViewModel } from '../viewmodels/usePlayerDetailViewModel';
import styles from '../styles/PlayerDetailView.module.css';

export default function PlayerDetailView() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Recupero stato di navigazione (per pulsante "Indietro" intelligente e liste contesto)
  const initialPlayer = location.state?.player || null;
  const contextList = location.state?.contextList || []; 
  const returnPath = location.state?.from || '/'; 

  const { player, prevPlayer, nextPlayer, loading, error } = usePlayerDetailViewModel(id, initialPlayer, contextList);

  /** Naviga al giocatore adiacente preservando il contesto */
  const goToPlayer = (targetPlayer) => {
    navigate(`/giocatori/${targetPlayer.id}`, { 
      state: { 
        player: targetPlayer, 
        contextList: contextList, 
        from: returnPath 
      } 
    });
  };

  /** Naviga alla lista giocatori della squadra */
  const handleTeamClick = () => {
    if (player.teamId) {
      navigate(`/squadre/${player.teamId}/giocatori`);
    }
  };

  /** Cerca la nazione globalmente */
  const handleNationalityClick = () => {
    if (player.nationality) {
      navigate(`/ricerca?q=${encodeURIComponent(player.nationality)}`);
    }
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
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <button onClick={() => navigate(returnPath)} className={styles.backBtn}>
          ← Torna alla lista
        </button>
      </div>
      
      {/* Controlli di navigazione contesto (Prev/Next) */}
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

      <div className={styles.detailCard}>
        <div className={styles.header}>
          <img src={player.photo} alt={player.name} className={styles.mainPhoto} />
          <h1>{player.name}</h1>
        </div>
        
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <strong>Squadra</strong> 
            <span 
              onClick={handleTeamClick} 
              className={player.teamId ? styles.clickableLink : ''}
              title={player.teamId ? "Vedi rosa squadra" : ""}
            >
              {player.team}
            </span>
          </div>

          <div className={styles.infoItem}>
            <strong>Nazionalità</strong> 
            <span 
              onClick={handleNationalityClick}
              className={styles.clickableLink}
              title="Cerca nazione"
            >
              {player.nationality}
            </span>
          </div>

          <div className={styles.infoItem}><strong>Età</strong> <span>{player.age}</span></div>
          <div className={styles.infoItem}>
            <strong>Rating</strong> <span className={styles.rating}>{formattedRating}</span>
          </div>
          <div className={styles.infoItem}><strong>Gol Stagionali</strong> <span>{player.goals}</span></div>
          <div className={styles.infoItem}><strong>Ruolo</strong> <span>{player.position}</span></div>
        </div>
      </div>
    </div>
  );
}