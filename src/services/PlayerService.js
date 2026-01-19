/**
 * SERVICE: PlayerService.js
 * Gestisce le chiamate HTTP verso l'API diretta di API-Sports.
 * Utilizza variabili d'ambiente REACT_APP_ per Create React App.
 */
class PlayerService {
  constructor() {
    // Recupero della chiave dal file .env (deve iniziare con REACT_APP_)
    this.apiKey = process.env.REACT_APP_FOOTBALL_API_KEY;
    this.baseUrl = 'https://v3.football.api-sports.io';
    
    console.log('Servizio API-Sports inizializzato');
  }

  /**
   * Metodo privato per gestire le chiamate fetch ed evitare ripetizioni di codice.
   */
  async _apiCall(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'GET',
        headers: {
          'x-apisports-key': this.apiKey // Header specifico per API-Sports
        }
      });

      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }

      const data = await response.json();

      // API-Sports restituisce spesso errori all'interno del corpo JSON anche con status 200
      if (data.errors && Object.keys(data.errors).length > 0) {
        const errorMsg = JSON.stringify(data.errors);
        
        // Gestione errori comuni basata sulla documentazione
        if (errorMsg.includes("token") || errorMsg.includes("key")) {
          throw new Error("Chiave API non valida o mancante");
        }
        if (errorMsg.includes("limit") || errorMsg.includes("requests")) {
          throw new Error("Limite di richieste raggiunto (max 10/min per il piano free)");
        }
        throw new Error(`Errore API: ${errorMsg}`);
      }

      return data.response;
    } catch (error) {
      console.error(`Fallimento chiamata API [${endpoint}]:`, error.message);
      throw error;
    }
  }

  /**
   * Verifica se la chiave è valida e quanti crediti rimangono.
   */
  async testConnection() {
    console.log('Verifica stato account...');
    try {
      const status = await this._apiCall('status');
      console.log('Connessione riuscita. Dettagli account:', status);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Recupera la lista dei calciatori per una lega e stagione specifica.
   */
  async getPlayers(leagueId = 135, season = 2024) {
    console.log(`Scouting report: Lega ${leagueId}, Stagione ${season}`);
    // Aggiungiamo il parametro page=1 per limitare il carico
    return await this._apiCall(`players?league=${leagueId}&season=${season}&page=1`);
  }

  /**
   * Recupera le squadre di una lega (endpoint più leggero per test).
   */
  async getTeams(leagueId = 135, season = 2024) {
    console.log(`Recupero squadre: Lega ${leagueId}, Stagione ${season}`);
    return await this._apiCall(`teams?league=${leagueId}&season=${season}`);
  }
}

// Creazione di una singola istanza (Pattern Singleton) per tutta l'app
const playerServiceInstance = new PlayerService();

// Esportazione pulita per evitare avvisi ESLint
export default playerServiceInstance;