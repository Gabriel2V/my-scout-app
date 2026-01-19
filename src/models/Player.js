/**
 * MODEL: Player.js
 * Rappresenta la struttura dati del calciatore. 
 * Isola la logica di business e la validazione dei dati grezzi provenienti dall'API.
 */
export class Player {
  // Definiamo la struttura dati basata sulla risposta dell'API [cite: 1441]
  constructor(apiData) {
    this.id = apiData.player.id;
    this.name = apiData.player.name;
    this.photo = apiData.player.photo;
    this.nationality = apiData.player.nationality;
    this.age = apiData.player.age;
    this.team = apiData.statistics[0].team.name;
    this.rating = apiData.statistics[0].games.rating || "N/A";
    this.goals = apiData.statistics[0].goals.total || 0;
  }

  // Esempio di logica di business nel modello 
  isTopPlayer() {
    return parseFloat(this.rating) > 7.5;
  }
}