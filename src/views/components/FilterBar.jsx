/**
 * COMPONENT: FilterBar.jsx
 * Barra dei filtri per la lista giocatori
 * Contiene i controlli per filtrare per Rating (slider) e Ruolo (select)
 */
import React from 'react';
import styles from '../../styles/FilterBar.module.css';

export default function FilterBar({ 
  minRating, setMinRating, 
  roleFilter, setRoleFilter,
  natFilter, setNatFilter,
  nationsList,
  sortKey, setSortKey
}) {
  const roles = ['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterGroup}>
        <label className={styles.label}>
          Rating Minimo: <span>{minRating}</span>
        </label>
        <input 
          type="range" min="0" max="10" step="0.1" 
          value={minRating} onChange={(e) => setMinRating(e.target.value)} 
          className={styles.rangeInput}
        />
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>Ruolo:</label>
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          className={styles.select}
        >
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>Nazionalità:</label>
        <select 
          value={natFilter} 
          onChange={(e) => setNatFilter(e.target.value)}
          className={styles.select}
        >
          <option value="All">Tutte le nazioni</option>
          {nationsList.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div className={styles.sortGroup}>
        <label className={styles.label}>Ordina per:</label>
        <select 
          value={sortKey} 
          onChange={(e) => setSortKey(e.target.value)}
          className={styles.sortSelect}
        >
          <option value="rating">Miglior Rating</option>
          <option value="goals">Più Gol</option>
          <option value="name">Nome (A-Z)</option>
        </select>
      </div>
    </div>
  );
}