# ScoutMaster 2026 - Scouting Dashboard

**Esame di Applicazioni Web - Progetto Individuale**

**Studente:** Gabriele Vizzi
**Matricola:** 933539

---

## Descrizione del Progetto

ScoutMaster 2026 è una Single Page Application (SPA) sviluppata con React progettata per lo scouting calcistico. L'applicazione consente agli utenti di esplorare gerarchicamente il mondo del calcio (Nazioni > Campionati > Squadre > Giocatori), effettuare ricerche globali e analizzare le statistiche dettagliate dei singoli atleti.

Il progetto pone una forte enfasi sull'ottimizzazione delle risorse, implementando strategie avanzate di caching locale, lazy loading dei dati e monitoraggio attivo delle chiamate API per rispettare i limiti del fornitore esterno.

---

##  Demo e Documentazione

L'applicazione è deployata e accessibile online. Per garantire la sicurezza e il rispetto dei limiti dell'API gratuita, la chiave API in produzione è **limitata al dominio di GitHub Pages**.

- **Hub Documentazione:** [Dashboard Centrale](https://Gabriel2V.github.io/my-scout-app/)
- **Live App:** [ScoutMaster 2026 Live](https://Gabriel2V.github.io/my-scout-app/app/)
- **Documentazione Tecnica (JSDoc):** [Vedi Documentazione](https://Gabriel2V.github.io/my-scout-app/docs/jsdoc/)
- **Report Copertura Test:** [Vedi Coverage](https://Gabriel2V.github.io/my-scout-app/docs/coverage/)


---

## Stack Tecnologico

Il progetto utilizza uno stack basato sull'ecosistema React:

* **Core:** React.js (v18+);
* **Build Tool:** Vite;
* **Routing:** React Router DOM (con HashRouter);
* **State Management:** Custom Hooks e React Context;
* **Architettura:** MVVM (Model-View-ViewModel);
* **Styling:** CSS Modules per stili locali e variabili CSS globali per il tema;
* **Data Fetching:** Fetch API con gestione errori centralizzata;
* **Testing:** Vitest e React Testing Library per unit e integration test;
* **Servizio Dati Esterno:** [API-Football](https://www.api-football.com/) (API-Sports v3), utilizzato per il fetch in tempo reale di tutte le entità e statistiche calcistiche.

---

## Architettura del Software (Pattern MVVM)

Il codice è strutturato seguendo il pattern Model-View-ViewModel per garantire la separazione delle responsabilità e la manutenibilità del codice.

### 1. Model (`src/models/`)
Definisce la struttura dei dati e la logica di dominio.
* **Player.js:** Classe che normalizza i dati grezzi provenienti dall'API, gestendo casi di dati mancanti e fornendo metodi di utilità come `isTopPlayer()`.

### 2. ViewModel (`src/viewmodels/`)
Custom Hooks che fungono da ponte tra il Model e la View, gestendo la logica di presentazione, lo stato e il polling dei dati.
* **usePlayerDetailViewModel.js:** Gestisce il dettaglio giocatore implementando una logica **"Zero-Network Navigation"**. Se l'utente scorre tra i giocatori (Avanti/Indietro), il ViewModel utilizza i dati passati via contesto locale (Context List), azzerando i tempi di caricamento e il consumo API. Effettua il fetch remoto solo in caso di accesso diretto via URL (Deep Linking).
* **useSearchViewModel.js:** Implementa una **strategia di ricerca ibrida**: interroga prima la cache locale (`localStorage`) per risultati immediati e, solo se necessario, effettua chiamate API in background, unendo i risultati.
* **useApiUsageViewModel.js:** Centralizza la logica di monitoraggio delle quote API. Gestisce il polling automatico per aggiornare i contatori in tempo reale e le operazioni di manutenzione (reset contatori, pulizia cache) utilizzate dai componenti di debug.
* **useNationalTeamsViewModel.js:** Gestisce il recupero parallelo (`Promise.all`) delle principali nazionali mondiali.
* **usePlayerDetailViewModel.js:** Gestisce il recupero del singolo giocatore, con logica di fallback per recuperare i dati sia dalla navigazione precedente che tramite chiamata diretta.

### 3. View (`src/views/`)
Componenti React che si occupano solo del rendering dell'interfaccia utente.
* **Pages:** `Home`, `Nations`, `Series`, `Teams`, `Players`, `SearchResults`, `NationalTeams`, `NotFound`.
* **Dettaglio:** `PlayerDetailView` per la scheda singola.
* **Componenti UI:** `GenericCard`, `PlayerCard`, `FilterBar`, `ApiCounter`.

### 4. Service (`src/services/`)
* **PlayerService.js:** Singleton che gestisce tutte le comunicazioni HTTP. Implementa il monitoraggio del rate-limit giornaliero, la gestione dei token e la logica di paginazione delle chiamate verso API-Sports.

---
## Struttura del Progetto

Il progetto segue una struttura modulare che rispecchia la separazione dei compiti del pattern MVVM:

```text
my-scout-app/
├── public/           
├── src/
│   ├── assets/              # Risorse statiche (Logo Universitario)
│   ├── models/              # Business Logic & Data Normalization
│   │   └── Player.js        # Classe per la normalizzazione dei dati atleta
│   ├── services/            # Data Access Layer
│   │   └── PlayerService.js # Gestione chiamate API, caching e rate-limit
│   ├── viewmodels/          # Logica applicativa (Custom Hooks)
│   │   ├── usePlayersViewModel.js
│   │   ├── useSearchViewModel.js
│   │   └── ...
│   ├── views/               # Presentation Layer (UI)
│   │   ├── components/      # Widget riutilizzabili (Card, FilterBar, ApiCounter)
│   │   ├── layouts/         # Struttura comune (Navbar, Footer)
│   │   └── pages/           # Pagine principali (Home, Teams, PlayerDetail)
│   ├── styles/              # Fogli di stile (CSS Modules & Global)
│   ├── App.jsx              # Routing e composizione principale
│   ├── index.jsx            # Entry point applicazione
│   └── setupTests.js        # Configurazione ambiente di test
├── index.html               # Entry point html
├── hub.html                 # Hub documentazione, test, codice e applicazione
├── package.json             # Dipendenze e script
└── vite.config.js           # Configurazione Build e Test runner
```

---


## Funzionalità Principali

### Navigazione Gerarchica e Ricerca
L'applicazione permette due flussi di navigazione:
1. **Esplorazione Guidata:** Dalle Nazioni ai Campionati, fino alle Squadre e ai Giocatori, o attraverso le top nazionali, o tramite top players.
2. **Ricerca Globale "a Imbuto" basata su URL:** Un sistema di ricerca a doppia barra persistente nell'header, gestito tramite parametri URL combinati (?q=squadra&p=giocatore). L'interfaccia si adatta dinamicamente: mostra inizialmente una singola barra per cercare Nazioni o Squadre e, una volta compilata, rivela una seconda barra opzionale per cercare un giocatore specifico all'interno di quei risultati. Questo approccio garantisce che il tasto "Indietro" del browser funzioni sempre e che gli stati di ricerca complessi non vadano persi.

### Squadre Nazionali
Una sezione dedicata accessibile dalla Dashboard permette di visualizzare direttamente le principali **Squadre Nazionali** mondiali. A differenza della navigazione per Nazione (geografica), questa vista permette di accedere direttamente alle rose dei convocati delle federazioni (Nazionali di esempio come Italiana, Argentina, ecc. chiamate manualmente, poichè l'API non supporta top team nazionali).

### Top Players
Una sezione dedicata accessibile dalla Dashboard permette di visualizzare direttamente i **Top Players** mondiali, richiesti da API come top player per lega (delle pricipali: Seria A, Ligue 1, Bundesliga, La Liga, Premier League); di seguito carica tutti i giocatori già scaricati attraverso altre pagine presenti in cache, per consentire un infinite scroll maggiore.


### Ottimizzazione e Performance (Lazy Loading)
Per gestire grandi moli di dati e limiti API ristretti:
* **Infinite Scroll:** La pagina `Players` implementa un caricamento progressivo basato su `IntersectionObserver`.
* **Paginazione Remota:** Il caricamento dei giocatori avviene in batch (pagine) solo quando l'utente scorre la lista, riducendo il carico iniziale.

### Strategie di Caching
Il progetto implementa una strategia di caching a più livelli per minimizzare le chiamate di rete e migliorare la reattività:

1.  **LocalStorage (Persistente):** Utilizzato per dati che cambiano raramente (lista nazioni, dettagli squadre, rose giocatori). Permette all'app di funzionare quasi offline per le risorse già visitate.
2.  **SessionStorage (Volatile):** Implementato nel `useSearchViewModel`. Memorizza i risultati dell'ultima ricerca effettuata. Questo garantisce che, tornando indietro da una pagina di dettaglio, i risultati della ricerca ricarichino istantaneamente senza ricaricare l'API ("Instant Back-Navigation").
3.  **Data Re-hydration:** Il Model `Player.js` è progettato per gestire sia dati grezzi (dall'API) che dati "re-idratati" (dallo stato della navigazione), permettendo di passare oggetti complessi tra le viste senza doverli riscaricare.

### Filtraggio Avanzato e Ordinamento
La barra dei filtri (`FilterBar`) è stata potenziata per offrire un controllo granulare:
* **Filtro Nazionalità Dinamico:** La lista delle nazionalità disponibili viene generata dinamicamente in base ai giocatori effettivamente presenti in lista.
* **Ordinamento Dinamico:** Possibilità di ordinare i risultati per **Miglior Rating**, **Numero di Gol** o in **Ordine Alfabetico**.
* **Filtro Testuale Locale:** Ogni lista di giocatori include un campo di ricerca locale per filtrare istantaneamente i nomi all'interno della selezione corrente senza attivare nuove chiamate API.

### Navigazione Contestuale
La vista di dettaglio (`PlayerDetailView`) mantiene il contesto della lista di provenienza. L'utente può scorrere tra i giocatori (Precedente/Successivo) direttamente dalla scheda di dettaglio senza dover tornare all'elenco principale, grazie al passaggio dello stato tramite React Router.

### Ricerca Ibrida Intelligente
Il sistema di ricerca (`useSearchViewModel`) adotta un approccio "Local-First":
1.  All'input dell'utente, scansiona istantaneamente il `localStorage` per trovare giocatori, squadre o nazioni già visitati;
2.  Esegue una chiamata API solo se il termine di ricerca è nuovo;
3.  Aggrega i risultati locali e remoti rimuovendo i duplicati, garantendo un feedback immediato all'utente e risparmiando chiamate API.

A causa di una rigorosa limitazione strutturale dell'API esterna (API-Sports), non è possibile cercare globalmente un giocatore per nome senza specificare l'ID della sua squadra o lega di appartenenza. Per aggirare questo blocco e garantire un'ottima User Experience, il sistema di ricerca (`useSearchViewModel`) adotta un approccio "Local-First" combinato a una logica "a imbuto":

**Scansione Immediata** (Local-First): All'input dell'utente, scansiona istantaneamente il `localStorage` per trovare giocatori, squadre o nazioni già visitati in precedenza. Questo permette di trovare giocatori "globalmente" se sono già salvati in cache.

**Ricerca API a imbuto, se il termine è nuovo:**

1. (Barra 1): Cerca globalmente le Squadre corrispondenti al termine inserito.

2. (Barra 2): Se l'utente compila anche la seconda barra (Giocatore), il ViewModel preleva gli ID delle migliori squadre trovate allo Step 1 e lancia chiamate API parallele (Promise.all) per cercare il giocatore all'interno di quelle specifiche squadre, aggirando il blocco dell'API.

**Aggregazione e Pulizia Visiva:** Aggrega i risultati locali e remoti rimuovendo i duplicati. Se l'utente sta cercando esplicitamente un giocatore (usando entrambe le barre), l'interfaccia nasconde i risultati di Nazioni e Squadre, mostrando solo gli atleti.

### Monitoraggio API e Debug
L'applicazione include un sistema robusto per la gestione dei limiti del tier gratuito di API-Sports (100 chiamate/giorno):
* **Service Layer:** `PlayerService` tiene traccia delle chiamate HTTP e blocca le richieste se il limite è raggiunto, prevenendo errori 429.
* **ViewModel Layer:** `useApiUsageViewModel` aggiorna l'interfaccia in tempo reale (polling ogni 2s) e gestisce la logica di reset.
* **UI:** Il widget `ApiCounter` cambia colore (Verde/Giallo/Rosso) in base alla percentuale di utilizzo, mentre la pagina `ApiDebug` offre strumenti per pulire la cache e resettare i contatori manualmente.

### Gestione Limiti API (Free Plan Protection)
Poiché l'API utilizzata impone restrizioni severe sul piano gratuito (max 100 chiamate/giorno, max pagina 3 per la paginazione), sono stati implementati meccanismi di difesa attiva:

* **Pagination Hard-Limit:** I ViewModel interrompono automaticamente le richieste oltre la pagina 3 per prevenire errori 403/429 e spreco di quota.
* **Concurrency Semaphore:** Utilizzo di `useRef` ("isFetching") nei ViewModel per prevenire *Race Conditions* e doppie chiamate involontarie durante lo scroll veloce (Infinite Scroll).
* **Deduplicazione nel Service:** Il `PlayerService` traccia le richieste avviate(`pendingRequests`) e restituisce la stessa Promise a chiamate parallele identiche, evitando il problema del "Double Fetch" di React in Strict Mode.

---

## Approfondimento Tecnico: Gestione Stati e Flusso Dati

L'applicazione adotta una gestione rigorosa del ciclo di vita dei componenti e degli stati asincroni, secondo il pattern MVVM.

### 1. Sincronizzazione Ricerca e URL
La ricerca globale è gestita tramite l'hook `useSearchParams`. Questo separa la **Ricerca Globale** (che identifica nuove entità) dal **Filtraggio Locale** (che agisce sui dati già caricati). In questo modo, navigando verso la pagina di una squadra, il termine di ricerca nell'header non entra in conflitto con la visualizzazione della rosa completa, ma rimane disponibile per tornare ai risultati precedenti.

### 2. Gestione dello Stato di Caricamento (Loading)
Per garantire una User Experience fluida, è stata implementata una gestione esplicita dello stato di caricamento tramite l'hook `useState`. Lo stato `loading` viene inizializzato a `true` e aggiornato a `false` solo al termine delle operazioni asincrone (`finally`), garantendo che l'interfaccia mostri sempre un feedback coerente durante l'attesa.

### 3. Gestione degli Errori e Pagina 404
La strategia di gestione degli errori avviene su due livelli:
- **Livello Service:** Il modulo `PlayerService.js` intercetta le risposte HTTP non valide, sollevando eccezioni specifiche che vengono propagate al ViewModel.
- **Livello View:** È stata implementata una rotta "catch-all" (`*`) che reindirizza l'utente a una pagina **NotFound (404)** personalizzata in caso di inserimento di URL inesistenti, fornendo un tasto rapido per tornare alla Dashboard principale.

---

## Architettura del Routing e Navigazione

L'applicazione utilizza React Router DOM per gestire la navigazione lato client (SPA).

### 1. Configurazione del Router
È stato utilizzato `HashRouter` (importato come `Router`) per garantire la compatibilità del deployment su hosting statici (come GitHub Pages), gestendo i percorsi tramite l'identificatore fragment (#).

### 2. Layout e Struttura Visiva
Il `MainLayout` utilizza un sistema a griglia per il Footer, garantendo che il logo universitario e i testi informativi siano sempre correttamente bilanciati e centrati. La Dashboard principale è stata ottimizzata per mostrare le tre macro-aree (Nazioni, Nazionali, Top Player) affiancate orizzontalmente su schermi desktop, adattandosi fluidamente su dispositivi mobile.

### 3. Navigazione Ibrida
La navigazione avviene attraverso due modalità:
- **Dichiarativa:** Tramite il componente `Link` (es. nelle `PlayerCard`) per una navigazione semantica e accessibile.
- **Programmatica:** Tramite l'hook `useNavigate` (es. nelle `GenericCard` o nella logica di ricerca) per gestire cambi di rotta in risposta a eventi complessi.

---

## Installazione e Avvio

### Prerequisiti
* Node.js installato
* Una chiave API valida di API-Sports (Football API)

### Setup

1. Clonare il repository:
```bash
git clone [https://github.com/Gabriel2V/my-scout-app.git](https://github.com/Gabriel2V/my-scout-app.git)
cd my-scout-app

```

2. Installare le dipendenze:

```bash
npm install

```

3. Creare un file `.env` nella root del progetto:

```
VITE_FOOTBALL_API_KEY=la_tua_chiave_api

```

4. Avviare il server di sviluppo:

```bash
npm run dev

```

L'app sarà disponibile all'indirizzo http://localhost:3000.

---

## Documentazione Tecnica

Il progetto utilizza **JSDoc** per la generazione automatica della documentazione tecnica. I commenti nel codice seguono lo standard JSDoc per descrivere parametri, tipi di ritorno e logica dei moduli.

Per generare e visualizzare la documentazione:
1. Eseguire il comando: `npm run docs`
2. Aprire il file `docs/gen/index.html` nel browser.

## Testing e Coverage

Il progetto include una suite di test completa basata su **Vitest** e **React Testing Library**.
La copertura include:

* **Unit Test dei Service:** Verifica del mocking di `fetch`, gestione errori HTTP e parsing della risposta.
* **Integration Test dei ViewModel:** Verifica della logica di business, gestione del loading state e integrazione con il `localStorage` (mockato) senza dover renderizzare l'intera UI.
* **Component Testing:** Verifica del rendering dei componenti (es. `PlayerCard`, `ApiCounter`) e delle interazioni utente.
* **Page Testing:** Verifica del routing e dei flussi completi (es. `PlayerDetailView` che mostra il loading e poi i dati).

Oltre ai test funzionali, è possibile generare un report della copertura del codice (Code Coverage).

- **Eseguire i test:** `npm test`
- **Generare report coverage:** `npm run coverage` (oppure `npx vitest run --coverage`)

### Generazione automatica dei report
Per rigenerare contemporaneamente sia la documentazione JSDoc che il report di coverage nella cartella `/docs`, è disponibile il comando:

```bash
npm run full-report

```

## Documentazione e Coverage Report online

È possibile consultare online la documentazione tecnica e i report di copertura:

- [Hub Documentazione](https://Gabriel2V.github.io/my-scout-app)
- [📚 Documentazione Tecnica (JSDoc)](https://Gabriel2V.github.io/my-scout-app/jsdoc/index.html)
- [📊 Report Copertura Test (Coverage)](https://Gabriel2V.github.io/my-scout-app/coverage/index.html)

---

## Sicurezza e Deployment

* **Variabili d'ambiente:** La chiave API non è inclusa nel codice sorgente per motivi di sicurezza, ma viene gestita in sicurezza tramite variabili d'ambiente e caricate tramite import.meta.env.
* **Deployment:** Configurato per hosting statici tramite HashRouter e gh-pages.

---

## Sviluppi Futuri
Il progetto ha diversi possibili sviluppi futuri, in particolare si ritiene utili:
* **Autenticazione Firebase:** introduzione di un'area riservata per permettere agli "scout" di salvare i giocatori preferiti in una Watchlist persistente sul cloud;
* **Backend Proxy:** sostituire la chiamata diretta all'API-Sports con un server Node.js intermediario per proteggere totalmente la chiave API e implementare un caching distribuito (Redis), slegando i limiti dell'API dal singolo client.

---

## Licenza

Progetto accademico rilasciato a scopo didattico - Licenza MIT
