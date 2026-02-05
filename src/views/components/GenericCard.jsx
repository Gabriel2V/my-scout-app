/**
 * @component GenericCard
 * @description Componente UI riutilizzabile per visualizzare elementi in griglia (nazioni, squadre, giocatori).
 * @param {string} title - Titolo principale della card.
 * @param {string} image - URL dell'immagine o logo.
 * @param {string} [variant="default"] - Variante stilistica ("circle" per giocatori).
 * @param {Function} onClick - Handler per l'interazione.
 */
import React from 'react';
import styles from '../../styles/Card.module.css';

export default function GenericCard({ image, title, subtitle, onClick, children, variant = 'square' }) {
  //  prop 'variant' per cambiare leggermente lo stile
  const imageClass = variant === 'circle' ? styles.photoCircle : styles.photoStandard;

  return (
    <div className={styles.card} onClick={onClick}>
      {image && <img src={image} alt={title} className={imageClass} />}
      <h3>{title}</h3>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      
      {/* 'children' permette di inserire bottoni extra (come in Series.jsx) */}
      {children && <div className={styles.extra}>{children}</div>}
    </div>
  );
}