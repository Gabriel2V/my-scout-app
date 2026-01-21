/**
 * VIEW: PlayerDetailView.jsx
 * Visualizza i dettagli completi del singolo calciatore.
 * Utilizza useParams per recuperare l'ID dall'URL
 */
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import PlayerService from '../services/PlayerService';
import { Player } from '../models/Player';
import styles from '../styles/PlayerDetailView.module.css';

export default function PlayerDetailView() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Tentativo di recupero dallo state (navigazione)
  const initialPlayer = location.state?.player || null;

  const [player, setPlayer] = useState(initialPlayer);
  const [loading, setLoading] = useState(!initialPlayer);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Se abbiamo il player dallo state, siamo a posto.
    if (player) return;

    // Altrimenti (refresh pagina o link diretto), scarichiamo.
    const loadSinglePlayer = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching player details form API...");
        const data = await PlayerService.getPlayerById(id);
        
        if (data && data.length > 0) {
          const newPlayer = new Player(data[0]);
          setPlayer(newPlayer);
        } else {
          setError("Giocatore non trovato o API limitata.");
        }
      } catch (err) {
        console.error(err);
        setError("Errore di connessione o limite API raggiunto.");
      } finally {
        setLoading(false);
      }
    };

    loadSinglePlayer();
  }, [id]); // Rimosso 'player' dalle dipendenze per evitare loop

  if (loading) return <div className={styles.loading}>Caricamento dettagli...</div>;

  if (error) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', color: 'white' }}>
        <h2> {error}</h2>
        <p>Prova a tornare indietro o ricaricare tra un minuto.</p>
        <button onClick={() => navigate(-1)} className={styles.backBtn} style={{background:'none', border:'none', cursor:'pointer', color: '#00ff88'}}>
          Torna indietro
        </button>
      </div>
    );
  }

  // Se non c'è loading, non c'è errore, ma player è null, mostriamo errore generico invece di redirect
  if (!player) return <div className={styles.loading}>Dati giocatore non disponibili.</div>;

  return (
    <div className={styles.container}>
      <button 
        onClick={() => navigate(-1)} 
        className={styles.backBtn}
        style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 0, color: '#00ff88', fontFamily:'inherit'}}
      >
        ← Torna indietro
      </button>
      
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