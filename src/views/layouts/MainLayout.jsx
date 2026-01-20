import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import styles from '../../styles/Layout.module.css';

export default function MainLayout() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Logica di navigazione per la ricerca
    if (value.trim().length > 1) {
      // Se l'utente scrive, andiamo alla pagina dedicata alla ricerca
      if (location.pathname !== '/ricerca') {
        navigate('/ricerca');
      }
    } else if (value.trim() === '' && location.pathname === '/ricerca') {
      // Se cancella tutto mentre è in ricerca, torna alla home
      navigate('/');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div 
          className={styles.logo} 
          onClick={() => {
            setSearchTerm('');
            navigate('/');
          }} 
          style={{cursor: 'pointer'}}
        >
          My Scout App
        </div>
        <div className={styles.searchBar}>
          <input 
            type="text" 
            placeholder="Cerca giocatori, squadre..." 
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </header>
      
      <main className={styles.content}>
        {/* Passiamo il contesto a tutte le pagine figlie */}
        <Outlet context={{ searchTerm, setSearchTerm }} />
      </main>

      <footer className={styles.footer}>
        <p>My Scout App - Autore: Gabriele - 2026</p>
      </footer>
    </div>
  );
}