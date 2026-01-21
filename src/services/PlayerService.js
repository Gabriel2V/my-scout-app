/**
 * SERVICE: PlayerService.js
 * Gestisce tutte le chiamate asincrone verso API-Sports.
 */
class PlayerService {
  constructor() {
    this.apiKey = process.env.REACT_APP_FOOTBALL_API_KEY;
    this.baseUrl = 'https://v3.football.api-sports.io';
  }

  async _apiCall(endpoint) {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'GET',
      headers: { 'x-apisports-key': this.apiKey }
    });
    if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
    const data = await response.json();
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

  // --- NUOVO: Metodo ottimizzato per top players globali ---
  async getTopPlayers(season = 2024) {
    // Strategia ibrida: topscorers + topassists dalle leghe top
    // Questo dà un mix bilanciato di attaccanti e centrocampisti
    
    const topLeagues = [
      { id: 39, name: 'Premier League' },      // Inghilterra
      { id: 140, name: 'La Liga' },            // Spagna  
      { id: 135, name: 'Serie A' },            // Italia
    ];

    try {
      const allPromises = [];
      
      // Per ogni lega, prendi top 10 scorers E top 10 assists
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
      
      // Combina e rimuovi duplicati
      const allPlayers = results.flat();
      const uniquePlayers = Array.from(
        new Map(allPlayers.map(item => [item.player.id, item])).values()
      );

      console.log(`Caricati ${uniquePlayers.length} top players globali`);
      return uniquePlayers;
      
    } catch (error) {
      console.error("Errore nel caricamento dei top players:", error);
      // Fallback: solo Premier League top scorers
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
}

const playerServiceInstance = new PlayerService();
export default playerServiceInstance;