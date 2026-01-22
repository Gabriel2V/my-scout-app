import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import styles from '../../styles/Layout.module.css';
import uniLogo from '../../assets/logo_uni.png'; 
import ApiCounter from '../components/ApiCounter';

export default function MainLayout() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim().length > 1) {
      if (location.pathname !== '/ricerca') {
        navigate('/ricerca');
      }
    } else if (value.trim() === '' && location.pathname === '/ricerca') {
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
        <Outlet context={{ searchTerm, setSearchTerm }} />
      </main>

      <footer className={styles.footer}>
        {/* LOGO A SINISTRA */}
        <img src={uniLogo} alt="Logo Università" className={styles.footerLogo} />
        
        {/* TESTO A DESTRA */}
        <div className={styles.footerText}>
          <p>My Scout App - Progetto Esame: Applicazioni Web</p>
          <p>Autore: Gabriele Vizzi - Matricola: 933539 - 2026</p>
        </div>
      </footer>
      {/* Contatore API floating */}
      <ApiCounter />
    </div>
  );
}