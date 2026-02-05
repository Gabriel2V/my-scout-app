/** 
 * @component Info 
 * @description Pagina informativa sul progetto e dati dello studente. 
*/
import React from 'react';
import styles from '../../styles/HomePage.module.css';

export default function Info() {
  return (
    <div className={styles.hero} style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h2 className="pageTitle">Informazioni sul Progetto</h2>
      
      <section style={{ marginBottom: '2rem' }}>
        <h3>ScoutMaster 2026</h3>
        <p>Dashboard avanzata per lo scouting calcistico professionale, sviluppata come progetto individuale per l'esame di Applicazioni Web.</p>
      </section>

      <section style={{ marginBottom: '2rem', padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
        <h4>Dati Studente</h4>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
          <li><strong>Autore:</strong> Gabriele Vizzi</li>
          <li><strong>Matricola:</strong> 933539</li>
          <li><strong>Corso:</strong> Applicazioni Web - 2026</li>
        </ul>
      </section>

      <section>
        <h4>Caratteristiche Tecniche</h4>
        <p>L'applicazione utilizza il pattern <strong>MVVM</strong> per una netta separazione tra logica e interfaccia.</p>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>Integrazione con API-Sports (Football API).</li>
          <li>Sistema di caching locale (localStorage) per ottimizzazione chiamate.</li>
          <li>Design responsivo con CSS Modules e variabili globali.</li>
          <li>Monitoraggio in tempo reale del traffico API.</li>
        </ul>
      </section>
    </div>
  );
}