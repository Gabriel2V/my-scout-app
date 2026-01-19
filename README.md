# ScoutMaster 2026 - Scouting Dashboard

**Esame di Applicazioni Web - Progetto Individuale**

Studente: [Tuo Nome e Cognome]  
Matricola: [Tua Matricola]

Scadenza Consegna: 15 Febbraio 2026

## Descrizione del Progetto

ScoutMaster 2026 è una Single Page Application (SPA) progettata per facilitare il lavoro di scouting calcistico in vista dei prossimi Mondiali. L'applicazione permette di esplorare un database dinamico di calciatori, visualizzarne le statistiche dettaglie e filtrare le informazioni in tempo reale.

L'applicazione è accessibile online al seguente indirizzo:  
[Inserisci qui la URI del tuo progetto, es: https://username.github.io/my-scout-app/]

## Stack Tecnologico

Il progetto è stato sviluppato utilizzando tecnologie moderne e scalabili:

- **Core**: React.js (v19.x)
- **Routing**: React Router DOM (v6.4+) per la navigazione dinamica tra le pagine
- **State Management & Logic**: Custom Hooks per l'implementazione del pattern MVVM
- **Styling**: CSS Modules per garantire l'incapsulamento degli stili ed evitare conflitti globali
- **Dati**: Fetch API per la comunicazione asincrona con il servizio esterno API-Sports

## Organizzazione del Progetto (Pattern MVVM)

Seguendo i principi dell'ingegneria del software descritti nel materiale del corso, il codice è organizzato secondo il design pattern Model-View-ViewModel (MVVM):

1. **Model** (`src/models/`): Contiene la logica di business e la definizione delle strutture dati (Classe `Player.js`). È indipendente dalla tecnologia di visualizzazione.

2. **ViewModel** (`src/viewmodels/`): Implementato tramite il custom hook `usePlayersViewModel.js`. Gestisce lo stato dell'UI (`useState`), il recupero asincrono dei dati (`useEffect`) e la logica di filtraggio.

3. **View** (`src/views/`): Componenti JSX responsabili esclusivamente della presentazione. Ricevono dati e callback dal ViewModel tramite props.

4. **Service** (`src/services/`): Modulo dedicato esclusivamente alle chiamate HTTP (AJAX/Fetch) verso l'API esterna.

## Funzionalità Implementate

In conformità con i requisiti minimi e gli optional indicati per il progetto:

- **Servizio Esterno**: Integrazione con l'API di API-Sports per il recupero di dati reali su calciatori e statistiche.
- **Visualizzazione a Elenco e Card**: Dashboard principale con griglia di card responsive.
- **Dettaglio Item**: Pagina di approfondimento per ogni singolo calciatore con validazione dei parametri tramite `useParams`.
- **Filtraggio**: Barra di ricerca dinamica che permette di filtrare i calciatori per nome istantaneamente.
- **Design Visivo**: Interfaccia scura (Dark Mode) moderna, progettata per garantire leggibilità e un'esperienza utente gradevole.

## Come lanciare il progetto localmente

Per eseguire il progetto sul proprio computer, seguire questi passaggi:

### 1. Clonare il repository

```bash
git clone https://github.com/tuo-username/my-scout-app.git
cd my-scout-app
```

### 2. Installare le dipendenze

```bash
npm install
```

### 3. Configurare le variabili d'ambiente

Creare un file `.env` nella root del progetto e inserire la propria chiave API:

```
REACT_APP_FOOTBALL_API_KEY=la_tua_chiave_api_qui
```

### 4. Avviare l'applicazione

```bash
npm start
```

L'app sarà disponibile all'indirizzo `http://localhost:3000`.

## Sicurezza e Deployment

- **Variabili d'ambiente**: La chiave API non è inclusa nel codice sorgente per motivi di sicurezza, ma viene gestita tramite il file `.env` in locale e tramite i "Secrets" di GitHub per la versione online.
- **GitHub Pages**: Il deployment automatico è gestito tramite il pacchetto `gh-pages`.

## Approfondimento Tecnico: Gestione Stati e Flusso Dati

L'applicazione adotta una gestione rigorosa del ciclo di vita dei componenti e degli stati asincroni, come raccomandato dai principi del pattern MVVM. La logica è centralizzata nel ViewModel (`usePlayersViewModel.js`), garantendo una netta separazione tra la logica di business e la presentazione.

### 1. Gestione dello Stato di Caricamento (Loading)

Per garantire una User Experience fluida, è stata implementata una gestione esplicita dello stato di caricamento tramite l'hook `useState`:

- **Inizializzazione**: Lo stato `loading` viene impostato inizialmente a `true` nel ViewModel.
- **Reattività della View**: Il componente `PlayerListView` monitora questo stato e, finché è attivo, renderizza un feedback visuale per l'utente, evitando la visualizzazione di elenchi vuoti o incoerenti.
- **Aggiornamento**: Al termine della chiamata asincrona all'interno dell'hook `useEffect`, lo stato viene impostato a `false`, innescando il re-rendering della View con i dati pronti.

### 2. Gestione degli Errori e Side-Effects

Il recupero dei dati avviene tramite un side-effect gestito dall'hook `useEffect`. La strategia di gestione degli errori si articola su due livelli:

- **Livello Service**: Il modulo `PlayerService.js` utilizza blocchi `try/catch` per intercettare fallimenti di rete o risposte HTTP non valide. Vengono sollevate eccezioni specifiche per errori comuni come il superamento del rate-limit (429) o problemi di autorizzazione (401/403).
- **Livello View**: La pagina di dettaglio (`PlayerDetailView.jsx`) implementa una validazione preventiva dei parametri della rotta tramite `useParams`. Se un utente tenta di accedere a un ID non esistente, il sistema reagisce reindirizzando programmaticamente l'utente alla dashboard tramite il componente `Maps`, evitando crash dell'applicazione.

### 3. Efficienza delle Chiamate API

Per ottimizzare l'uso delle risorse e rispettare i limiti della Fetch API esterna, la chiamata al servizio avviene esclusivamente nella fase di Mounting del componente, passando un array di dipendenze vuoto `[]` all'hook `useEffect`. Questo impedisce loop infiniti di richieste e garantisce che i dati vengano recuperati una sola volta per sessione.

## Architettura del Routing e Navigazione

Per la gestione della navigazione interna, l'applicazione utilizza la libreria React Router DOM, implementando un sistema di routing lato client che permette il cambio di contenuti senza ricaricare la pagina HTML.

### 1. Configurazione del Router

Come suggerito nella guida di studio per facilitare il deployment su piattaforme di hosting statico (come GitHub Pages), è stato utilizzato il componente `HashRouter` (importato con l'alias `Router`). Questa scelta garantisce che i percorsi siano gestiti correttamente tramite l'identificatore fragment (`#`) nell'URL, evitando errori di "404 Not Found" durante il refresh della pagina.

### 2. Definizione delle Rotte

Il componente principale `App.jsx` definisce l'albero di navigazione utilizzando il wrapper `Routes`:

- **Rotta Statica** (`/`): Associa la radice dell'applicazione alla vista principale `PlayerListView`, che mostra l'elenco completo dei calciatori.
- **Rotta Dinamica** (`/player/:id`): Implementa un pattern di navigazione dinamica. Il parametro `:id` funge da segnaposto variabile, permettendo al componente `PlayerDetailView` di identificare e renderizzare le informazioni specifiche del calciatore selezionato.
- **Rotta di Fallback** (`*`): È stata configurata una "catch-all route" che intercetta qualsiasi URL non definito, indirizzando l'utente verso un componente di errore (NotFound), migliorando la robustezza dell'applicazione.

### 3. Navigazione e Recupero Parametri

La navigazione tra le viste avviene in modo dichiarativo:

- **Componente `Link`**: Utilizzato all'interno delle card per attivare il cambio di rotta senza ricaricare il browser.
- **Hook `useParams`**: All'interno della vista di dettaglio, viene utilizzato l'hook `useParams` per estrarre programmaticamente l'ID dal percorso dell'URL. Questo ID viene poi convertito e utilizzato per interrogare il dataset fornito dal ViewModel, realizzando il binding tra URL e stato dei dati.

## Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file [LICENSE](LICENSE) per maggiori dettagli.