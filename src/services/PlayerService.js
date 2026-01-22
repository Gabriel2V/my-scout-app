/**
 * SERVICE: PlayerService.js
 * Gestisce tutte le chiamate asincrone verso API-Sports con monitoraggio limite giornaliero
 * Supporto per caricamento incrementale (Lazy Loading) dei Top Players
 */
class PlayerService {
  constructor() {
    this.apiKey = process.env.REACT_APP_FOOTBALL_API_KEY;
    this.baseUrl = 'https://v3.football.api-sports.io';
    this.dailyLimit = 100;
    this.warningThreshold = 80;
    
    // Lista ordinata dei campionati da caricare sequenzialmente
    this.topLeagues = [
      { id: 39, name: 'Premier League' }, // 1. Inghilterra
      { id: 135, name: 'Serie A' },       // 2. Italia
      { id: 140, name: 'La Liga' },       // 3. Spagna
      { id: 78, name: 'Bundesliga' },     // 4. Germania
      { id: 61, name: 'Ligue 1' }         // 5. Francia
    ];
  }

  // --- SISTEMA DI MONITORAGGIO API ---
  _getApiCounter() {
    const stored = localStorage.getItem('api_counter');
    if (!stored) return { count: 0, date: new Date().toDateString() };
    const counter = JSON.parse(stored);
    const today = new Date().toDateString();
    if (counter.date !== today) return { count: 0, date: today };
    return counter;
  }

  _incrementApiCounter() {
    const counter = this._getApiCounter();
    counter.count += 1;
    localStorage.setItem('api_counter', JSON.stringify(counter));
    const percentage = Math.round((counter.count / this.dailyLimit) * 100);
    const emoji = counter.count >= this.warningThreshold ? '⚠️' : 
                  counter.count >= this.dailyLimit ? '🚫' : '✅';
    console.log(`${emoji} API Call #${counter.count}/${this.dailyLimit} (${percentage}%)`);
    return counter;
  }

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

  // --- CHIAMATA API BASE ---
  async _apiCall(endpoint) {
    const counter = this._getApiCounter();
    if (counter.count >= this.dailyLimit) {
      throw new Error(`Limite API raggiunto. Usa i dati in cache.`);
    }

    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'GET',
      headers: { 'x-apisports-key': this.apiKey }
    });
    
    if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
    
    const data = await response.json();
    this._incrementApiCounter();
    
    return data.response;
  }

  // Metodi navigazione gerarchica
  getCountries() { return this._apiCall('countries'); }
  getLeagues(countryId) { return this._apiCall(`leagues?country=${countryId}`); }
  getTeams(leagueId, season = 2024) { return this._apiCall(`teams?league=${leagueId}&season=${season}`); }
  
  // SCARICAMENTO COMPLETO ROSA 
  async getPlayersByTeam(teamId, season = 2024) { 
    let allPlayers = [];
    let page = 1;
    while (true) {
      console.log(`Scaricamento rosa squadra ${teamId} - Pagina ${page}...`);
      try {
        const pageData = await this._apiCall(`players?team=${teamId}&season=${season}&page=${page}`);
        if (!pageData || pageData.length === 0) break;
        allPlayers = [...allPlayers, ...pageData];
        if (pageData.length < 20) break;
        page++;
        if (page > 5) break; 
      } catch (error) {
        console.warn(`Errore pagina ${page} squadra ${teamId}:`, error);
        break; 
      }
    }
    return allPlayers;
  }
  
  getPlayersByLeague(leagueId, season = 2024, page = 1) { return this._apiCall(`players?league=${leagueId}&season=${season}&page=${page}`); 
  }
  // Scarica un solo campionato alla volta per indice
  async getTopPlayersBatch(batchIndex, season = 2024) {
    // Se abbiamo finito i campionati, restituisci array vuoto
    if (batchIndex >= this.topLeagues.length) return [];

    const league = this.topLeagues[batchIndex];
    console.log(`Scaricamento batch ${batchIndex + 1}: ${league.name}`);

    try {
      // Scarica i top 20 marcatori di questo campionato
      const data = await this._apiCall(`players/topscorers?league=${league.id}&season=${season}`);
      return data.slice(0, 20); 
    } catch (error) {
      console.error(`Errore batch ${league.name}:`, error);
      return [];
    }
  }

  searchPlayers(searchTerm) { return this._apiCall(`players?search=${encodeURIComponent(searchTerm)}`); }
  searchTeams(searchTerm) { return this._apiCall(`teams?search=${encodeURIComponent(searchTerm)}`); }

  resetApiCounter() {
    localStorage.removeItem('api_counter');
    console.log('Contatore API resettato manualmente');
  }
}

const playerServiceInstance = new PlayerService();
export default playerServiceInstance;