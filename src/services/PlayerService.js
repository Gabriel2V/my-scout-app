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

  // Nuovi metodi per la navigazione gerarchica
  getCountries() { return this._apiCall('countries'); }
  getLeagues(countryId) { return this._apiCall(`leagues?country=${countryId}`); }
  getTeams(leagueId, season = 2024) { return this._apiCall(`teams?league=${leagueId}&season=${season}`); }
  getPlayersByTeam(teamId, season = 2024) { return this._apiCall(`players?team=${teamId}&season=${season}`); }
  getPlayersByLeague(leagueId, season = 2024) { return this._apiCall(`players?league=${leagueId}&season=${season}`); }
  // ... altri metodi ...

  // NUOVO METODO: Scarica un solo giocatore (consuma 1 chiamata, ma scarica poco dati)
  getPlayerById(id, season = 2024) { return this._apiCall(`players?id=${id}&season=${season}`); }

}

const playerServiceInstance = new PlayerService();
export default playerServiceInstance;