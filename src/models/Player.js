/**
 * @module Models/Player
 * @description Modello di dominio (Domain Entity) per il Calciatore.
 * Pattern Adapter/Normalizer: Il costruttore agisce da adattatore, trasformando la struttura 
 * complessa e nidificata dell'API (response -> player -> statistics) in un oggetto per le View.
 * Gestisce anche la "reidratazione" da oggetti JSON salvati in cache/storage.
 */
export class Player {
  /**
   * Crea un'istanza di Player.
   * @param {Object} apiData - L'oggetto grezzo ricevuto dall'API o dal localStorage.
   * @property {number} id - Identificativo univoco.
   * @property {string} name - Nome completo.
   * @property {string} photo - URL della foto profilo.
   * @property {string} position - Ruolo (es. Attacker, Defender).
   * @property {string} rating - Valutazione media (stringa, es. "7.2").
   * @property {number} goals - Numero totale di gol nella stagione corrente.
   */
  constructor(apiData) {
    // Caso 1: Reidratazione da oggetto già normalizzato (es. da Cache o State)
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
      return; 
    }

    // Caso 2: Normalizzazione da risposta API grezza
    this.id = apiData.player?.id;
    this.name = apiData.player?.name;
    this.photo = apiData.player?.photo;
    this.nationality = apiData.player?.nationality;
    this.age = apiData.player?.age;

    // Estrazione statistiche dal primo array (campionato principale)
    const stats = apiData.statistics?.[0] || {};
    this.position = stats.games?.position || "N/A";
    this.team = stats.team?.name || "N/A";
    this.teamId = stats.team?.id;
    this.rating = stats.games?.rating || "N/A";
    this.goals = stats.goals?.total || 0;
  }

  /**
   * Determina se il giocatore è considerato un "Top Player".
   * @returns {boolean} True se il rating è superiore a 7.5.
   */
  isTopPlayer() {
    return this.rating !== "N/A" && parseFloat(this.rating) > 7.5;
  }
}