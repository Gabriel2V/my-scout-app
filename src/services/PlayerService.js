/**
 * @module Services/PlayerService
 * @description Servizio core per l'integrazione con l'API esterna (API-Sports).
 * Responsabilità:
 * - Gestione centralizzata delle chiamate HTTP (fetch).
 * - Monitoraggio proattivo dei limiti API (Rate Limiting) tramite conteggio locale.
 * - Deduplicazione delle richieste in volo (Request Deduplication) per evitare chiamate ridondanti.
 * - Normalizzazione degli endpoint e gestione degli header di autenticazione.
 */
class PlayerService {
  /**
   * @class PlayerService
   * @description Singleton che incapsula tutte le chiamate HTTP verso il fornitore di dati calcistici.
   * Inizializza le configurazioni, le chiavi API e i contatori.
   */
  constructor() {
    this.apiKey = import.meta.env.VITE_FOOTBALL_API_KEY;
    this.baseUrl = 'https://v3.football.api-sports.io';
    this.dailyLimit = 100;
    
    /** Leghe principali per la home page
     * @type {Array<{id: number, name: string}>} 
     */
    this.topLeagues = [
      { id: 39, name: 'Premier League' },
      { id: 135, name: 'Serie A' },
      { id: 140, name: 'La Liga' },
      { id: 78, name: 'Bundesliga' },
      { id: 61, name: 'Ligue 1' }
    ];
    
    /** * Mappa per tracciare le richieste in corso (Promise).
     * Evita il "double fetch" tipico di React StrictMode o componenti multipli.
     * @type {Map<string, Promise>} 
     */
    this.pendingRequests = new Map();
  }

  /**
   * Sincronizza il contatore locale con i dati effettivi del server.
   * Effettua una chiamata all'endpoint `/status` (che è GRATUITO).
   * Logica Conservativa: Aggiorna il contatore locale solo se il server riporta 
   * un utilizzo maggiore rispetto a quello tracciato localmente.
   * @returns {Promise<Object>} Oggetto usage aggiornato.
   */
  async syncUsageWithApi() {
    try {
      if (!this.apiKey) return this.getApiUsage();

      const response = await fetch(`${this.baseUrl}/status`, {
        method: 'GET',
        headers: {
          'x-apisports-key': this.apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });

      const data = await response.json();

      if (data.response && data.response.requests) {
        const serverUsed = data.response.requests.current;
        const localCounter = this._getApiCounter();
        
        // Aggiorna solo se server > locale
        if (serverUsed > localCounter.count) {
          const usageData = {
            count: serverUsed,
            date: new Date().toDateString()
          };
          localStorage.setItem('api_counter', JSON.stringify(usageData));
        }
        return this.getApiUsage();
      }
    } catch (error) {
      console.error("Errore sincronizzazione API Status:", error);
    }
    return this.getApiUsage();
  }

  /**
   * Recupera il conteggio attuale dal localStorage.
   */
  _getApiCounter() {
    const stored = localStorage.getItem('api_counter');
    if (!stored) return { count: 0, date: new Date().toDateString() };
    const counter = JSON.parse(stored);
    // Reset giornaliero se la data è cambiata
    if (counter.date !== new Date().toDateString()) return { count: 0, date: new Date().toDateString() };
    return counter;
  }

  /**
   * Incrementa il contatore locale dopo una chiamata riuscita.
   * @private
   */
  _incrementApiCounter() {
    const counter = this._getApiCounter();
    counter.count += 1;
    localStorage.setItem('api_counter', JSON.stringify(counter));
    return counter;
  }

  /**
   * Restituisce le statistiche di utilizzo API formattate per la UI.
   * @returns {{used: number, limit: number, remaining: number, percentage: number, date: string}}
   */
  getApiUsage() {
    const counter = this._getApiCounter();
    return {
      used: counter.count,
      limit: this.dailyLimit,
      remaining: Math.max(0, this.dailyLimit - counter.count),
      percentage: Math.round((counter.count / this.dailyLimit) * 100),
      date: counter.date
    };
  }

  getApiConfig() {
    return {
      baseUrl: this.baseUrl,
      isConfigured: !!this.apiKey
    };
  }

  /**
   * Esegue la chiamata HTTP effettiva verso l'API.
   * Gestisce il caching delle Promise in volo e gli errori API specifici.
   * * @private
   * @param {string} endpoint - Il percorso relativo dell'API (es. "players?id=...").
   * @returns {Promise<any>} Il payload `response` dell'API.
   * @throws {Error} Se il limite API è raggiunto o se c'è un errore HTTP.
   */
  async _apiCall(endpoint) {
    // Controllo deduplicazione richieste in volo
    if (this.pendingRequests.has(endpoint)) {
      return this.pendingRequests.get(endpoint);
    }

    const requestPromise = (async () => {
      try {
        const counter = this._getApiCounter();
        // Controllo preventivo limite locale
        if (counter.count >= this.dailyLimit) throw new Error(`Limite API giornaliero raggiunto (Locale).`);

        const response = await fetch(`${this.baseUrl}/${endpoint}`, {
          method: 'GET',
          headers: { 
            'x-apisports-key': this.apiKey,
            'x-rapidapi-host': 'v3.football.api-sports.io' 
          }
        });
        
        if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
        
        const data = await response.json();

        //  Controllo errori applicativi API-Sports
        if (data.errors && Object.keys(data.errors).length > 0) {
            const msg = Object.values(data.errors)[0]; 
            throw new Error(`API Error: ${msg}`);
        }
        
        if (!data.response) {
            return [];
        }
        
        // 3. Incremento contatore solo a successo
        this._incrementApiCounter();
        return data.response;
      } finally {
        // Pulizia richiesta dalla mappa
        this.pendingRequests.delete(endpoint);
      }
    })();

    this.pendingRequests.set(endpoint, requestPromise);
    return requestPromise;
  }

  // --- Metodi Pubblici di Fetch ---

  getCountries() { return this._apiCall('countries'); }
  getLeagues(countryId) { return this._apiCall(`leagues?country=${countryId}`); }
  getTeams(leagueId, season = 2024) { return this._apiCall(`teams?league=${leagueId}&season=${season}`); }
  getPlayersByTeam(teamId, season = 2024, page = 1) { return this._apiCall(`players?team=${teamId}&season=${season}&page=${page}`); }
  getPlayersByLeague(leagueId, season = 2024, page = 1) { return this._apiCall(`players?league=${leagueId}&season=${season}&page=${page}`); }
  searchPlayerInTeam(searchTerm, teamId) { 
    return this._apiCall(`players?search=${encodeURIComponent(searchTerm)}&team=${teamId}`); 
  }
  
  async getTopPlayersBatch(batchIndex, season = 2024) {
    if (batchIndex >= this.topLeagues.length) return [];
    const league = this.topLeagues[batchIndex];
    const data = await this._apiCall(`players/topscorers?league=${league.id}&season=${season}`);
    return data.slice(0, 20); // Limita per performance
  }
  
  searchPlayers(searchTerm) { return this._apiCall(`players?search=${encodeURIComponent(searchTerm)}`); }
  searchTeams(searchTerm) { return this._apiCall(`teams?search=${encodeURIComponent(searchTerm)}`); }
  
  /** Resetta il contatore locale (Per debug/manutenzione) */
  resetApiCounter() { localStorage.removeItem('api_counter'); }
}

export default new PlayerService();