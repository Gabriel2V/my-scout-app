/**
 * @component FilterBar
 * @description Barra degli strumenti per il filtraggio e l'ordinamento dinamico delle liste di giocatori.
 * Fornisce controlli per rating, ruolo, nazionalità e criterio di ordinamento.
 * * @param {Object} props
 * @param {number} props.minRating - Valore corrente del filtro rating minimo (0-10).
 * @param {Function} props.setMinRating - Setter per il rating minimo.
 * @param {string} props.roleFilter - Valore corrente del filtro ruolo (es. 'Midfielder', 'All').
 * @param {Function} props.setRoleFilter - Setter per il filtro ruolo.
 * @param {string} props.natFilter - Valore corrente del filtro nazionalità.
 * @param {Function} props.setNatFilter - Setter per il filtro nazionalità.
 * @param {Array<string>} props.nationsList - Lista di stringhe delle nazioni disponibili per il dropdown.
 * @param {string} props.sortKey - Chiave di ordinamento attiva ('rating', 'goals', 'name', 'default').
 * @param {Function} props.setSortKey - Setter per la chiave di ordinamento.
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
      {/* Gruppo: Filtro Rating */}
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

      {/* Gruppo: Filtro Ruolo */}
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

      {/* Gruppo: Filtro Nazionalità */}
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

      {/* Gruppo: Ordinamento */}
      <div className={styles.sortGroup}>
        <label className={styles.label}>Ordina per:</label>
        <select 
          value={sortKey} 
          onChange={(e) => setSortKey(e.target.value)}
          className={styles.sortSelect}
        >
          <option value="default">Predefinito</option>
          <option value="rating">Miglior Rating</option>
          <option value="goals">Più Gol</option>
          <option value="name">Nome (A-Z)</option>
        </select>
      </div>
    </div>
  );
}