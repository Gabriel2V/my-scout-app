/**
 * SERVICE: PlayerService.js
 * Gestisce tutte le chiamate asincrone verso API-Sports con monitoraggio limite giornaliero
 */
class PlayerService {
  constructor() {
    this.apiKey = process.env.REACT_APP_FOOTBALL_API_KEY;
    this.baseUrl = 'https://v3.football.api-sports.io';
    this.dailyLimit = 100;
    this.warningThreshold = 80; // Alert quando si supera l'80%
  }

  // --- SISTEMA DI MONITORAGGIO API ---
  _getApiCounter() {
    const stored = localStorage.getItem('api_counter');
    if (!stored) return { count: 0, date: new Date().toDateString() };
    
    const counter = JSON.parse(stored);
    const today = new Date().toDateString();
    
    // Reset automatico se è un nuovo giorno
    if (counter.date !== today) {
      return { count: 0, date: today };
    }
    
    return counter;
  }

  _incrementApiCounter() {
    const counter = this._getApiCounter();
    counter.count += 1;
    localStorage.setItem('api_counter', JSON.stringify(counter));
    
    // Log colorato in console
    const percentage = Math.round((counter.count / this.dailyLimit) * 100);
    const emoji = counter.count >= this.warningThreshold ? '⚠️' : 
                  counter.count >= this.dailyLimit ? '🚫' : '✅';
    
    console.log(
      `${emoji} API Call #${counter.count}/${this.dailyLimit} (${percentage}%)`
    );
    
    // Alert se si supera il limite
    if (counter.count === this.warningThreshold) {
      console.warn('ATTENZIONE: Raggiunto 80% del limite API giornaliero!');
    }
    
    if (counter.count >= this.dailyLimit) {
      console.error('LIMITE RAGGIUNTO: Hai esaurito le chiamate API giornaliere!');
    }
    
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

  // --- CHIAMATA API CON CONTROLLO LIMITE ---
  async _apiCall(endpoint) {
    const counter = this._getApiCounter();
    
    // Blocca se limite raggiunto
    if (counter.count >= this.dailyLimit) {
      throw new Error(
        `Limite API raggiunto (${counter.count}/${this.dailyLimit}). ` +
        `Riprova domani o usa i dati in cache.`
      );
    }

    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'GET',
      headers: { 'x-apisports-key': this.apiKey }
    });
    
    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Incrementa contatore SOLO se la chiamata ha successo
    this._incrementApiCounter();
    
    return data.response;
  }

  // Metodi navigazione gerarchica
  getCountries() { 
    return this._apiCall('countries'); 
  }
  
  getLeagues(countryId) { 
    return this._apiCall(`leagues?country=${countryId}`); 
  }
  
  getTeams(leagueId, season = 2024) { 
    return this._apiCall(`teams?league=${leagueId}&season=${season}`); 
  }
  
  getPlayersByTeam(teamId, season = 2024) { 
    return this._apiCall(`players?team=${teamId}&season=${season}`); 
  }
  
  getPlayersByLeague(leagueId, season = 2024) { 
    return this._apiCall(`players?league=${leagueId}&season=${season}`); 
  }

  // Metodo ottimizzato per top players globali
  async getTopPlayers(season = 2024) {
    const topLeagues = [
      { id: 39, name: 'Premier League' },
      { id: 140, name: 'La Liga' },
      { id: 135, name: 'Serie A' },
    ];

    try {
      const allPromises = [];
      
      topLeagues.forEach(league => {
        allPromises.push(
          this._apiCall(`players/topscorers?league=${league.id}&season=${season}`)
            .then(data => data.slice(0, 10))
            .catch(() => [])
        );
        allPromises.push(
          this._apiCall(`players/topassists?league=${league.id}&season=${season}`)
            .then(data => data.slice(0, 10))
            .catch(() => [])
        );
      });

      const results = await Promise.all(allPromises);
      const allPlayers = results.flat();
      const uniquePlayers = Array.from(
        new Map(allPlayers.map(item => [item.player.id, item])).values()
      );

      console.log(`Caricati ${uniquePlayers.length} top players globali`);
      return uniquePlayers;
      
    } catch (error) {
      console.error("Errore nel caricamento dei top players:", error);
      return this._apiCall(`players/topscorers?league=39&season=${season}`);
    }
  }

  // Metodi di ricerca
  searchPlayers(searchTerm) {
    return this._apiCall(`players?search=${encodeURIComponent(searchTerm)}`);
  }

  searchTeams(searchTerm) {
    return this._apiCall(`teams?search=${encodeURIComponent(searchTerm)}`);
  }

  // --- METODO UTILITÀ PER RESET MANUALE ---
  resetApiCounter() {
    localStorage.removeItem('api_counter');
    console.log('Contatore API resettato manualmente');
  }
}

const playerServiceInstance = new PlayerService();
export default playerServiceInstance;