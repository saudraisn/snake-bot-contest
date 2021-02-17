class Player {
  id
  // A player is being passed a unique Id at the beginning of the game
  init(id) {
    this.id = id
    return null
  }

  nextStep(game) {
    return  {move : 'RIGHT'}
  }
}

new Player()
