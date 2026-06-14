const gameState = {
  score: 0,
  falls: 0,

  reset() {
    this.score = 0;
    this.falls = 0;
  }
};

export default gameState;