/**
 * @module Models/Player
 * @description Modello di dominio per un calciatore.
 * Isola la logica di validazione e fornisce metodi helper (es. isTopPlayer) 
 */
export class Player {
  /**
   * @class Player
   * @description Rappresenta un calciatore normalizzato. Converte i dati grezzi dell'API in un formato piatto utilizzabile dalla UI.
   * @param {Object} apiData - Dati grezzi provenienti dall'API Football.
   * @property {number} id - ID univoco del giocatore.
   * @property {string} name - Nome completo.
   * @property {string} rating - Valutazione media (es. "7.5").
   */
  constructor(apiData) {
    // Se l'oggetto ha già le proprietà 'piatte' e non ha la struttura API 'player'
    // Significa che stiamo ricaricando un oggetto Player salvato nello state o nella cache.
    if (!apiData.player && apiData.id) {
      this.id = apiData.id;
      this.name = apiData.name;
      this.photo = apiData.photo;
      this.nationality = apiData.nationality;
      this.age = apiData.age;
      this.position = apiData.position;
      this.team = apiData.team;
      this.teamId = apiData.teamId;
      this.rating = apiData.rating;
      this.goals = apiData.goals;
      return; // Stop, abbiamo finito.
    }

    // Logica standard per i dati grezzi dell'API
    this.id = apiData.player?.id;
    this.name = apiData.player?.name;
    this.photo = apiData.player?.photo;
    this.nationality = apiData.player?.nationality;
    this.age = apiData.player?.age;

    // Statistiche
    const stats = apiData.statistics?.[0] || {};
    this.position = stats.games?.position || "N/A";
    this.team = stats.team?.name || "N/A";
    this.teamId = stats.team?.id;
    this.rating = stats.games?.rating || "N/A";
    this.goals = stats.goals?.total || 0;
  }

  isTopPlayer() {
    return this.rating !== "N/A" && parseFloat(this.rating) > 7.5;
  }
}