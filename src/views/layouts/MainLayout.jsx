/**
 * @component MainLayout
 * @description Struttura portante dell'applicazione.
 * Contiene l'Header con la ricerca globale "Search-on-Enter" e il Footer informativo.
 */
import { Outlet, useNavigate, useLocation, useSearchParams, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from '../../styles/Layout.module.css';
import uniLogo from '../../assets/logo_uni.png'; 
import ApiCounter from '../components/ApiCounter';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Stato locale per l'input (quello che l'utente scrive)
  const [localInput, setLocalInput] = useState(searchParams.get('q') || '');

  // Sincronizza l'input locale se l'URL cambia (es. navigazione indietro)
  useEffect(() => {
    setLocalInput(searchParams.get('q') || '');
  }, [searchParams]);

  // Funzione che avvia effettivamente la ricerca nell'app
  const triggerSearch = () => {
    const value = localInput.trim();
    if (value.length >= 1) {
      navigate(`/ricerca?q=${encodeURIComponent(value)}`);
    } else if (value === '' && location.pathname === '/ricerca') {
      navigate('/');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      triggerSearch();
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo} onClick={() => navigate('/')}>
            My Scout App
          </div>
          <nav className={styles.nav}>
            <NavLink to="/" className={({isActive}) => isActive ? styles.activeLink : styles.navLink}>HOME</NavLink>
            <NavLink to="/info" className={({isActive}) => isActive ? styles.activeLink : styles.navLink}>INFO</NavLink>
            <NavLink to="/api-debug" className={({isActive}) => isActive ? styles.activeLink : styles.navLink}>API</NavLink>
          </nav>
        </div>

        <div className={styles.searchContainer}>
          <div className={styles.searchBar}>
            <input 
              type="text" 
              placeholder="Cerca nazioni, squadre, giocatori..." 
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className={styles.searchButton} onClick={triggerSearch}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      <main className={styles.content}>
        <Outlet context={{ globalSearchTerm: searchParams.get('q') || '', setSearchTerm: setLocalInput }} />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerCol}>
          <h4>ScoutMaster 2026</h4>
          <NavLink to="/" className={styles.footerLink}>Home</NavLink>
          <NavLink to="/info" className={styles.footerLink}>Info Progetto</NavLink>
          <NavLink to="/api-debug" className={styles.footerLink}>API Monitor</NavLink>
        </div>
        <div className={styles.footerColCenter}>
          <p>Progetto Esame: Applicazioni Web</p>
          <p>Autore: Gabriele Vizzi</p>
          <p>Matricola: 933539 - Anno 2026</p>
        </div>
        <div className={styles.footerColRight}>
          <img src={uniLogo} alt="Logo Università" className={styles.footerLogo} />
        </div>
      </footer>
      <ApiCounter />
    </div>
  );
}