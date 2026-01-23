/**
 * LAYOUT: MainLayout.jsx
 * Layout principale dell'applicazione (HOC)
 * Contiene l'Header (con ricerca), il Footer e il wrapper per il contenuto dinamico (Outlet)
 */
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from '../../styles/Layout.module.css';
import uniLogo from '../../assets/logo_uni.png'; 
import ApiCounter from '../components/ApiCounter';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Lo stato della barra di ricerca è ora sincronizzato con l'URL o il contesto
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  // Se l'URL cambia (es. premo "Indietro"), aggiorna il testo nella barra
  useEffect(() => {
    const query = searchParams.get('q');
    if (location.pathname === '/ricerca') {
      setSearchTerm(query || '');
    } else if (location.pathname === '/') {
       setSearchTerm('');
    }
  }, [searchParams, location.pathname]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim().length >= 1) {
      // Naviga ai risultati passando il termine nell'URL (Query String)
      navigate(`/ricerca?q=${encodeURIComponent(value)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => { setSearchTerm(''); navigate('/'); }}>
          My Scout App
        </div>
        <div className={styles.searchBar}>
          <input 
            type="text" 
            placeholder="Cerca nazioni, squadre, giocatori..." 
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </header>
      
      <main className={styles.content}>
        {/* Passiamo setSearchTerm per permettere alle pagine di resettare la barra se necessario */}
        <Outlet context={{ globalSearchTerm: searchTerm, setSearchTerm }} />
      </main>

      <footer className={styles.footer}>
        <img src={uniLogo} alt="Logo Università" className={styles.footerLogo} />
        <div className={styles.footerText}>
          <p>My Scout App - Progetto Esame: Applicazioni Web</p>
          <p>Autore: Gabriele Vizzi - Matricola: 933539 - 2026</p>
        </div>
        <div className={styles.spacer}></div>
      </footer>
      <ApiCounter />
    </div>
  );
}