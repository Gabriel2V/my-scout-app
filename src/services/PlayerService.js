/**
 * SERVICE: PlayerService.js
 * Gestisce tutte le comunicazioni con l'API esterna (API-Sports)
 * Implementa il monitoraggio del rate-limit, il caching delle risposte e la logica di paginazione/lazy loading
 */
class PlayerService {
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
    const counter = this._getApiCounter();
    return {
      used: counter.count,
      limit: this.dailyLimit,
      remaining: Math.max(0, this.dailyLimit - counter.count),
      percentage: Math.round((counter.count / this.dailyLimit) * 100),
      date: counter.date
    };
  }

  async _apiCall(endpoint) {
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