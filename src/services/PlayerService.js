/**
 * SERVICE: PlayerService.js
 * Gestisce tutte le chiamate asincrone verso API-Sports con monitoraggio limite giornaliero
 */
class PlayerService {
  constructor() {
    this.apiKey = process.env.REACT_APP_FOOTBALL_API_KEY;
    this.baseUrl = 'https://v3.football.api-sports.io';
    this.dailyLimit = 100;
    this.warningThreshold = 80; 
  }

  // --- SISTEMA DI MONITORAGGIO API (Invariato) ---
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
    
    // Ciclo while per scaricare tutte le pagine (di solito sono 2 o 3 per squadra)
    while (true) {
      console.log(`Scaricamento rosa squadra ${teamId} - Pagina ${page}...`);
      
      try {
        const pageData = await this._apiCall(`players?team=${teamId}&season=${season}&page=${page}`);
        
        // Se la pagina è vuota, abbiamo finito
        if (!pageData || pageData.length === 0) break;
        
        allPlayers = [...allPlayers, ...pageData];
        
        // Se la pagina contiene meno di 20 risultati, è l'ultima pagina (l'API ne manda 20 x pagina)
        if (pageData.length < 20) break;
        
        page++;
        
        // Safety break: per evitare loop infiniti se l'API impazzisce (max 5 pagine = 100 giocatori)
        if (page > 5) break; 
        
      } catch (error) {
        console.warn(`Errore pagina ${page} squadra ${teamId}:`, error);
        break; //  in caso di errore per salvare almeno i dati parziali
      }
    }
    
    return allPlayers;
  }
  
  getPlayersByLeague(leagueId, season = 2024) { 
    return this._apiCall(`players?league=${leagueId}&season=${season}`); 
  }

  // Metodo ottimizzato per top players globali
  async getTopPlayers(season = 2024) {
    const topLeagues = [
      { id: 39, name: 'Premier League' },
      { id: 135, name: 'Serie A' }, // Serie A
      { id: 140, name: 'La Liga' },
    ];

    try {
      const allPromises = [];
      topLeagues.forEach(league => {
        allPromises.push(this._apiCall(`players/topscorers?league=${league.id}&season=${season}`).then(d => d.slice(0, 10)).catch(()=>[]));
      });
      const results = await Promise.all(allPromises);
      return results.flat();
    } catch (error) {
      return this._apiCall(`players/topscorers?league=135&season=${season}`); // Fallback Serie A
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