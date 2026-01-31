/**
 * LAYOUT: MainLayout.jsx
 * Layout principale dell'applicazione (HOC)
 * Contiene l'Header (con ricerca), il Footer e il wrapper per il contenuto dinamico (Outlet)
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
  
  // Lo stato della barra di ricerca è sincronizzato con la query string 'q' dell'URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  // Effetto per sincronizzare il testo nella barra di ricerca quando si usa il tasto "Indietro" o si cambia pagina
  useEffect(() => {
    const query = searchParams.get('q');
    if (location.pathname === '/ricerca') {
      setSearchTerm(query || '');
    } else if (location.pathname === '/') {
       setSearchTerm(''); // Svuota la barra se torniamo in Home senza parametri
    }
  }, [searchParams, location.pathname]);

  /**
   * Gestisce l'input di ricerca globale indirizzando l'utente alla pagina /ricerca
   * mantenendo il termine nell'URL per permettere la navigazione storica
   */
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim().length >= 1) {
      navigate(`/ricerca?q=${encodeURIComponent(value)}`);
    } else if (value.trim() === '' && location.pathname === '/ricerca') {
      navigate('/');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div 
            className={styles.logo} 
            onClick={() => {
              setSearchTerm('');
              navigate('/');
            }} 
          >
            My Scout App
          </div>
          
          <nav className={styles.nav}>
            <NavLink to="/" className={({isActive}) => isActive ? styles.activeLink : styles.navLink}>
              HOME
            </NavLink>
            <NavLink to="/info" className={({isActive}) => isActive ? styles.activeLink : styles.navLink}>
              INFO
            </NavLink>
            <NavLink to="/api-debug" className={({isActive}) => isActive ? styles.activeLink : styles.navLink}>
              API
            </NavLink>
          </nav>
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
        <Outlet context={{ globalSearchTerm: searchTerm, setSearchTerm }} />
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