/**
 * @module Services/PlayerService
 * @description Servizio core per l'integrazione con l'API esterna (API-Sports).
 * Gestisce la logica di fetching, il monitoraggio dei limiti di chiamata (rate-limiting),
 * il caching delle risposte e la normalizzazione degli endpoint.
 */
class PlayerService {
/**
 * @class PlayerService
 * @description Singleton che incapsula tutte le chiamate HTTP verso il fornitore di dati calcistici.
 */
  constructor() {
    this.apiKey = import.meta.env.VITE_FOOTBALL_API_KEY;
    this.baseUrl = 'https://v3.football.api-sports.io';
    this.dailyLimit = 100;
    this.topLeagues = [
      { id: 39, name: 'Premier League' },
      { id: 135, name: 'Serie A' },
      { id: 140, name: 'La Liga' },
      { id: 78, name: 'Bundesliga' },
      { id: 61, name: 'Ligue 1' }
    ];
    // FIX: Mappa per gestire le richieste in corso ed evitare duplicati
    this.pendingRequests = new Map();
  }

  _getApiCounter() {
    const stored = localStorage.getItem('api_counter');
    if (!stored) return { count: 0, date: new Date().toDateString() };
    const counter = JSON.parse(stored);
    if (counter.date !== new Date().toDateString()) return { count: 0, date: new Date().toDateString() };
    return counter;
  }

  _incrementApiCounter() {
    const counter = this._getApiCounter();
    counter.count += 1;
    localStorage.setItem('api_counter', JSON.stringify(counter));
    return counter;
  }

  getApiUsage() {
    /**
    * @method getApiUsage
    * @description Calcola l'utilizzo attuale delle API basandosi sul contatore locale.
    * @returns {Object} Oggetto contenente chiamate usate, rimanenti e percentuale di utilizzo.
    */
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
    /** @method getApiConfig @returns {Object} Dettagli tecnici (URL, Key mascherata). */
    return {
      baseUrl: this.baseUrl,
      isConfigured: !!this.apiKey
    };
  }

  async _apiCall(endpoint) {
    // FIX: Se c'è già una richiesta identica in corso, restituisci la sua promise
    if (this.pendingRequests.has(endpoint)) {
      return this.pendingRequests.get(endpoint);
    }

    const requestPromise = (async () => {
      try {
        const counter = this._getApiCounter();
        if (counter.count >= this.dailyLimit) throw new Error(`Limite API raggiunto.`);

        const response = await fetch(`${this.baseUrl}/${endpoint}`, {
          method: 'GET',
          headers: { 'x-apisports-key': this.apiKey }
        });
        
        if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
        const data = await response.json();
        
        this._incrementApiCounter();
        return data.response;
      } finally {
        // Pulizia: rimuovi la richiesta dalla mappa una volta completata (successo o errore)
        this.pendingRequests.delete(endpoint);
      }
    })();

    this.pendingRequests.set(endpoint, requestPromise);
    return requestPromise;
  }

  getCountries() { return this._apiCall('countries'); }
  getLeagues(countryId) { return this._apiCall(`leagues?country=${countryId}`); }
  getTeams(leagueId, season = 2024) { return this._apiCall(`teams?league=${leagueId}&season=${season}`); }

  getPlayersByTeam(teamId, season = 2024, page = 1) { 
    return this._apiCall(`players?team=${teamId}&season=${season}&page=${page}`);
  }
  
  getPlayersByLeague(leagueId, season = 2024, page = 1) { 
    return this._apiCall(`players?league=${leagueId}&season=${season}&page=${page}`); 
  }

  async getTopPlayersBatch(batchIndex, season = 2024) {
    if (batchIndex >= this.topLeagues.length) return [];
    const league = this.topLeagues[batchIndex];
    const data = await this._apiCall(`players/topscorers?league=${league.id}&season=${season}`);
    return data.slice(0, 20);
  }

  searchPlayers(searchTerm) { return this._apiCall(`players?search=${encodeURIComponent(searchTerm)}`); }
  searchTeams(searchTerm) { return this._apiCall(`teams?search=${encodeURIComponent(searchTerm)}`); }
  resetApiCounter() { localStorage.removeItem('api_counter'); }
}

export default new PlayerService();