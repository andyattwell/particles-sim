import Game from './Game';
export const INITIAL_GAME_CONFIG = {
  profileName: 'Default',
  containerWidth: 300,
  containerHeight: 300,
  canvasMaxWidth: 500,
  canvasMaxHeight: 500,
  particles: []
}

export const INITIAL_CONFIG = {
  profileName: 'Default',
  radius: 10,
  particleAmmount: 100,
  mass: 2.5,
  friction: 0.95,
  attractionForce: 0.4,
  collitionForce: 0.4,
  gravityForce: 0.003,
  containerWidth: 300,
  containerHeight: 300,
  canvasMaxWidth: 500,
  canvasMaxHeight: 500
}

export class GameControl {
  profiles = [INITIAL_GAME_CONFIG]
  config = INITIAL_GAME_CONFIG
  selectedProfile = 'Default'
  selectedParticle = null
  mouse = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isMouseDown: false
  }
  selectedTool = false

  constructor(canvasId, config) {
    this.game = new Game(canvasId, this.config)
  }

  start() {
    setTimeout(() => {
      this.game.start();
    }, 100)
  }

  pause() {
    return this.game.pause();
  }


}
