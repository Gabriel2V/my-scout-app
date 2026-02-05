/**
 * @component GenericCard
 * @description Componente UI polimorfico e riutilizzabile per la visualizzazione di entità in griglia.
 * Utilizzato per rappresentare Nazioni, Campionati e Squadre (e talvolta Giocatori in liste semplici).
 * Supporta l'iniezione di contenuto extra tramite `children` (es. bottoni d'azione).
 * * @param {Object} props - Proprietà del componente.
 * @param {string} props.title - Il titolo principale della card (es. Nome Squadra).
 * @param {string} props.image - URL della risorsa grafica (Logo, Bandiera o Foto).
 * @param {string} [props.subtitle] - Testo secondario opzionale visualizzato sotto il titolo.
 * @param {Function} [props.onClick] - Callback invocata al click sull'intera card.
 * @param {React.ReactNode} [props.children] - Elementi JSX opzionali da renderizzare nel footer della card.
 * @param {'square' | 'circle'} [props.variant='square'] - Variante stilistica per l'immagine ('circle' per avatar giocatori).
 */
import React from 'react';
import styles from '../../styles/Card.module.css';

export default function GenericCard({ image, title, subtitle, onClick, children, variant = 'square' }) {
  // Calcola la classe CSS in base alla variante richiesta
  const imageClass = variant === 'circle' ? styles.photoCircle : styles.photoStandard;

  return (
    <div className={styles.card} onClick={onClick}>
      {image && <img src={image} alt={title} className={imageClass} />}
      <h3>{title}</h3>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      
      {/* Area per contenuti iniettati (es. pulsanti "Vedi Rosa") */}
      {children && <div className={styles.extra}>{children}</div>}
    </div>
  );
}