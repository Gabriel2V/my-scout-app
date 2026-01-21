/**
 * MODEL: Player.js
 * Rappresenta la struttura dati del calciatore. 
 * Isola la logica di business e la validazione dei dati grezzi provenienti dall'API.
 */
export class Player {
  constructor(apiData) {
    this.id = apiData.player?.id;
    this.name = apiData.player?.name;
    this.photo = apiData.player?.photo;
    this.nationality = apiData.player?.nationality;
    this.age = apiData.player?.age;
    // Controllo sull'esistenza delle statistiche
    const stats = apiData.statistics?.[0] || {};
    this.position = stats.games?.position || "N/A"; // Difensore, Centrocampista, ecc.
    this.team = stats.team?.name || "N/A";
    this.rating = stats.games?.rating || "N/A";
    this.goals = stats.goals?.total || 0;
  }

  isTopPlayer() {
    return this.rating !== "N/A" && parseFloat(this.rating) > 7.5;
  }
}