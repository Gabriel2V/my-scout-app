# ScoutMaster 2026 - Scouting Dashboard

**Esame di Applicazioni Web - Progetto Individuale**

**Studente:** Gabriele Vizzi
**Matricola:** 933539

---

## Descrizione del Progetto

ScoutMaster 2026 è una Single Page Application (SPA) sviluppata con React progettata per lo scouting calcistico. L'applicazione consente agli utenti di esplorare gerarchicamente il mondo del calcio (Nazioni > Campionati > Squadre > Giocatori), effettuare ricerche globali e analizzare le statistiche dettagliate dei singoli atleti.

Il progetto pone una forte enfasi sull'ottimizzazione delle risorse, implementando strategie avanzate di caching locale, lazy loading dei dati e monitoraggio attivo delle chiamate API per rispettare i limiti del fornitore esterno.

---

## Stack Tecnologico

Il progetto utilizza uno stack moderno basato sull'ecosistema React:

* **Core:** React.js (v18+)
* **Build Tool:** Vite, scelto per la rapidità di compilazione e l'efficienza nello sviluppo.
* **Routing:** React Router DOM (HashRouter per compatibilità deployment statico)
* **State Management:** Custom Hooks e React Context
* **Architettura:** MVVM (Model-View-ViewModel)
* **Styling:** CSS Modules per stili locali e variabili CSS globali per il tema
* **Data Fetching:** Fetch API con gestione errori centralizzata
* **Testing:** Vitest e React Testing Library per unit e integration test, garantendo uno stack moderno e veloce.

---

## Architettura del Software (Pattern MVVM)

Il codice è strutturato seguendo rigorosamente il pattern Model-View-ViewModel per garantire la separazione delle responsabilità e la manutenibilità del codice.

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
Componenti React puri che si occupano solo del rendering dell'interfaccia utente.
* **Pages:** `Home`, `Nations`, `Series`, `Teams`, `Players`, `SearchResults`, `NationalTeams`, `NotFound`.
* **Dettaglio:** `PlayerDetailView` per la scheda singola.
* **Componenti UI:** `GenericCard`, `PlayerCard`, `FilterBar`, `ApiCounter`.

### 4. Service (`src/services/`)
* **PlayerService.js:** Singleton che gestisce tutte le comunicazioni HTTP. Implementa il monitoraggio del rate-limit giornaliero, la gestione dei token e la logica di paginazione delle chiamate verso API-Sports.

---

## Funzionalità Principali

### Navigazione Gerarchica e Ricerca
L'applicazione permette due flussi di navigazione:
1. **Esplorazione Guidata:** Dalle Nazioni ai Campionati, fino alle Squadre e ai Giocatori.
2. **Ricerca Globale Basata su URL:** Una barra di ricerca persistente nell'header che utilizza i parametri di ricerca nell'URL (`?q=searchTerm`). Questo approccio garantisce che il tasto "Indietro" del browser funzioni correttamente e che i risultati della ricerca non vadano persi durante la navigazione.

### Squadre Nazionali
Una sezione dedicata accessibile dalla Dashboard permette di visualizzare direttamente le principali **Squadre Nazionali** mondiali. A differenza della navigazione per Nazione (geografica), questa vista permette di accedere direttamente alle rose dei convocati delle federazioni (es. Nazionale Italiana, Argentina, ecc.).

### Ottimizzazione e Performance (Lazy Loading)
Per gestire grandi moli di dati e limiti API ristretti:
* **Infinite Scroll:** La pagina `Players` implementa un caricamento progressivo basato su `IntersectionObserver`.
* **Paginazione Remota:** Il caricamento dei giocatori avviene in batch (pagine) solo quando l'utente scorre la lista, riducendo il carico iniziale.

### Strategie di Caching
Il progetto implementa una strategia di caching a più livelli per minimizzare le chiamate di rete e migliorare la reattività:

1.  **LocalStorage (Persistente):** Utilizzato per dati che cambiano raramente (lista nazioni, dettagli squadre, rose giocatori). Permette all'app di funzionare quasi offline per le risorse già visitate.
2.  **SessionStorage (Volatile):** Implementato nel `useSearchViewModel`. Memorizza i risultati dell'ultima ricerca effettuata. Questo garantisce che, tornando indietro da una pagina di dettaglio, i risultati della ricerca riaiano istantaneamente senza ricaricare l'API ("Instant Back-Navigation").
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
1.  All'input dell'utente, scansiona istantaneamente il `localStorage` per trovare giocatori, squadre o nazioni già visitati.
2.  Esegue una chiamata API (debounced) solo se il termine di ricerca è nuovo.
3.  Aggrega i risultati locali e remoti rimuovendo i duplicati, garantendo un feedback immediato all'utente e risparmiando chiamate API.

### Monitoraggio API e Debug
L'applicazione include un sistema robusto per la gestione dei limiti del tier gratuito di API-Sports (100 chiamate/giorno):
* **Service Layer:** `PlayerService` tiene traccia delle chiamate HTTP e blocca le richieste se il limite è raggiunto, prevenendo errori 429.
* **ViewModel Layer:** `useApiUsageViewModel` aggiorna l'interfaccia in tempo reale (polling ogni 2s) e gestisce la logica di reset.
* **UI:** Il widget `ApiCounter` cambia colore (Verde/Giallo/Rosso) in base alla percentuale di utilizzo, mentre la pagina `ApiDebug` offre strumenti per pulire la cache e resettare i contatori manualmente.

### Gestione Limiti API (Free Plan Protection)
Poiché l'API utilizzata impone restrizioni severe sul piano gratuito (max 100 chiamate/giorno, max pagina 3 per la paginazione), sono stati implementati meccanismi di difesa attiva:

* **Pagination Hard-Limit:** I ViewModel interrompono automaticamente le richieste oltre la pagina 3 per prevenire errori 403/429 e spreco di quota.
* **Concurrency Semaphore:** Utilizzo di `useRef` ("isFetching") nei ViewModel per prevenire *Race Conditions* e doppie chiamate involontarie durante lo scroll veloce (Infinite Scroll).
* **Deduplicazione nel Service:** Il `PlayerService` traccia le richieste in volo (`pendingRequests`) e restituisce la stessa Promise a chiamate parallele identiche, evitando il problema del "Double Fetch" di React in Strict Mode.

---

## Approfondimento Tecnico: Gestione Stati e Flusso Dati

L'applicazione adotta una gestione rigorosa del ciclo di vita dei componenti e degli stati asincroni, secondo il pattern MVVM.

### 1. Sincronizzazione Ricerca e URL
La ricerca globale è gestita tramite l'hook `useSearchParams`. Questo separa la **Ricerca Globale** (che identifica nuove entità) dal **Filtraggio Locale** (che agisce sui dati già caricati). In questo modo, navigando verso la pagina di una squadra, il termine di ricerca nell'header non entra in conflitto con la visualizzazione della rosa completa, ma rimane disponibile per tornare ai risultati precedenti.

### 2. Gestione dello Stato di Caricamento (Loading)
Per garantire una User Experience fluida, è stata implementata una gestione esplicita dello stato di caricamento tramite l'hook `useState`. Lo stato `loading` viene inizializzato a `true` e aggiornato a `false` solo al termine delle operazioni asincrone (`finally`), garantendo che l'interfaccia mostri sempre un feedback coerente (skeleton o spinner) durante l'attesa.

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
- **Programmatica:** Tramite l'hook `useNavigate` (es. nelle `GenericCard` o nella logica di ricerca) per gestire cambi di rotta in risposta a eventi complessi o click su elementi non-ancora.

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

## Testing

Il progetto include una suite di test completa basata su **Vitest** e **React Testing Library**.
La copertura include:

* **Unit Test dei Service:** Verifica del mocking di `fetch`, gestione errori HTTP e parsing della risposta.
* **Integration Test dei ViewModel:** Verifica della logica di business, gestione del loading state e integrazione con il `localStorage` (mockato) senza dover renderizzare l'intera UI.
* **Component Testing:** Verifica del rendering dei componenti (es. `PlayerCard`, `ApiCounter`) e delle interazioni utente.
* **Page Testing:** Verifica del routing e dei flussi completi (es. `PlayerDetailView` che mostra il loading e poi i dati).
Per eseguire i test tramite Vitest:

```bash
npm test

```

## Sicurezza e Deployment

* **Variabili d'ambiente:** La chiave API non è inclusa nel codice sorgente per motivi di sicurezza, ma viene gestita in sicurezza tramite variabili prefissate con VITE_ e caricate tramite import.meta.env.
* **Deployment:** Configurato per hosting statici tramite HashRouter e gh-pages.

---

## Licenza

Progetto accademico rilasciato a scopo didattico - Licenza MIT
