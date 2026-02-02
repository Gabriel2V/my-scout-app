/**
 * VIEW: PlayerDetailView.jsx
 * Pagina di dettaglio. Delega logica e navigazione interamente al ViewModel.
 */
import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { usePlayerDetailViewModel } from '../viewmodels/usePlayerDetailViewModel';
import styles from '../styles/PlayerDetailView.module.css';

export default function PlayerDetailView() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Estrae dati dallo state della navigazione (Router)
  const initialPlayer = location.state?.player || null;
  const contextList = location.state?.contextList || []; 
  const returnPath = location.state?.from || '/'; 

  const { player, prevPlayer, nextPlayer, loading, error } = usePlayerDetailViewModel(id, initialPlayer, contextList);

  // Funzione di navigazione
  const goToPlayer = (targetPlayer) => {
    navigate(`/giocatori/${targetPlayer.id}`, { 
      state: { 
        player: targetPlayer, 
        contextList: contextList, 
        from: returnPath 
      } 
    });
  };
  const handleTeamClick = () => {
    if (player.teamId) {
      // Naviga alla lista giocatori di quella squadra
      navigate(`/squadre/${player.teamId}/giocatori`);
    }
  };
  const handleNationalityClick = () => {
    if (player.nationality) {
      // Cerca la nazione tramite la ricerca globale per trovare sia il paese che la nazionale
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
          {/* SQUADRA CLICCABILE*/}
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

          {/* NAZIONALITÀ CLICCABILE  */}
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