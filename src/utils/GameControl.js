import Game from './Game';

export const INITIAL_CONFIG = {
  profileName: 'Default',
  particleSize: 10,
  particleAmmount: 100,
  particleMass: 2.5,
  particleFriction: 0.95,
  attractionForce: 0.4,
  collitionForce: 0.4,
  gravityForce: 0.003,
  canvasWidth: 300,
  canvasHeight: 300,
  canvasMaxWidth: 500,
  canvasMaxHeight: 500
}

export class GameControl {
  profiles = [INITIAL_CONFIG]
  selectedProfile = 'Default'
  selectedParticle = null
  mouse = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isMouseDown: false
  }

  constructor(config) {
    this.config = INITIAL_CONFIG
    if (config) {
      this.config = config
    }
    this.loadSavedConfig()
  }

  start() {
    this.canvas = document.getElementById('game-canvas');
    this.setCanvasSize();
    
    this.game = new Game(this.canvas, this.config)
    this.game.start()

    const self = this;
    document.addEventListener('mousedown', (event) => {
      if (event.target === this.canvas) {
        self.handleClick(event)
        document.addEventListener('mousemove', mouseMove)
      }
    })

    const mouseMove = (event) => {
      self.handleMouseMove(event)
    }

    document.addEventListener('mouseup', (event) => {
      if (event.target === this.canvas) {
        self.handleMouseUp(event)
      }
      document.removeEventListener('mousemove', mouseMove)
    })

  }

  setCanvasSize(containerWidth) {
    // const size = this.getCanvasSize();
    const container = document.getElementById('canvas-container');
    if (!container) {
      return
    }
    let width = container.clientWidth;
    let height = container.clientHeight;

    if (containerWidth) {
      width = containerWidth;
    }

    this.canvas.setAttribute('width', width)
    this.canvas.setAttribute('height', height)

    this.config.canvasMaxWidth = width;
    this.config.canvasMaxHeight = height;

    if (this.config.canvasWidth > width) {
      this.config.canvasWidth = width;
    }
    if (this.config.canvasHeight > height) {
      this.config.canvasHeight = height;
    }

    this.saveConfig(this.config);
  }

  getCanvasSize() {
    const windowHeight = window.innerHeight
    const windowWidth = window.innerWidth

    const panelWidth = document.querySelector('#particle-controls').clientWidth + 20
    // const panelWidth = document.getElementById('#canvas-container').clientWidth + 20

    return {
      width: windowWidth - panelWidth,
      height: windowHeight
    }
  }

  handleClick(event) {
    let inBounds = this.checkWindowBouds(event.clientX, event.clientY)
    if (!inBounds) {
      return
    }
    this.mouse.startX = inBounds.x
    this.mouse.startY = inBounds.y
    this.mouse.isMouseDown = true

    const particle = this.game.particles.find((p) => p.isClicked(inBounds))
    if (particle) {
      this.selectedParticle = particle;
      this.selectedParticle.select();
    }
  }

  handleMouseUp(event) {
    if (!this.mouse.isMouseDown || !this.selectedParticle) return;

    this.mouse.endX = event.clientX;
    this.mouse.endY = event.clientY;
    this.mouse.isMouseDown = false;

    const direction = this.determineDirection(this.mouse.startX, this.mouse.startY, this.mouse.endX, this.mouse.endY);

    this.selectedParticle?.deselect();
    this.selectedParticle?.applyForce(10, {
      x: direction.x * 2,
      y: direction.y * 2
    });
    this.selectedParticle = null
  }

  handleMouseMove(event) {
    let inBounds = this.checkWindowBouds(event.clientX, event.clientY)
    if (!inBounds) {
      return
    }

    if (this.selectedParticle) {
      this.selectedParticle.move(inBounds.x, inBounds.y)
    }

    if (this.mouse.isMouseDown) {
      this.mouse.lastX = this.mouse.startX;
      this.mouse.lastY = this.mouse.startY;
    }
  }

  determineDirection(x1, y1, x2, y2) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    return {
      x: Math.tanh(deltaX), y: Math.tanh(deltaY)
    }
  }

  checkWindowBouds(pageX, pageY) {
    const windowHeight = this.canvas.height
    const windowWidth = this.canvas.width

    let canvasLeft = windowWidth / 2 - parseInt(this.config.canvasWidth) / 2
    let canvasRight = canvasLeft + parseInt(this.config.canvasWidth)
    let canvasTop = windowHeight / 2 - parseInt(this.config.canvasHeight) / 2
    let canvasBottom = canvasTop + parseInt(this.config.canvasHeight)
    const canvasPosition = this.canvas.getBoundingClientRect()

    if (pageX < canvasLeft || pageX > canvasRight || pageY < canvasTop || pageY > canvasBottom) {
      return false
    }

    return {
      x: pageX - canvasPosition.left,
      y: pageY - canvasPosition.top
    }
  }
  
  deleteConfig(profileName) {
    this.profiles = this.profiles.filter((p) => p.profileName !== profileName)

    this.saveToLocalStorage(this.profiles, 'Default')
    if (this.profiles.length == 0) {
      this.profiles = [INITIAL_CONFIG]
    }
    this.applyConfig(INITIAL_CONFIG, true)
  }

  saveConfig(config) {
    this.updateConfigProfile(config)
    this.applyConfig(config)
  }

  changeProfile (profileName) {
    const config = this.profiles.find((p) => p.profileName == profileName);
    if (!config) {
      config = this.profiles[0]
    }
    this.updateConfigProfile(config)
    this.applyConfig(config, true)
  }

  updateConfigProfile(config) {
    if (!config.profileName || config.profileName === '') {
      return false;
    }

    let found = false;
    const profiles = this.profiles.map((p) => {
      if (p.profileName === config.profileName) {
        found = true
        return config;
      }
      return p;
    })

    if (!found) {
      this.profiles.push(config)
    }

    this.saveToLocalStorage(this.profiles, config.profileName)
  
  }

  saveToLocalStorage(profiles, selectedProfile) {
    localStorage.setItem('partsim-config', JSON.stringify({
      profiles, selectedProfile
    }))
  }

  loadSavedConfig() {
    try {
      const lsitem = localStorage.getItem('partsim-config');
      const storeData = JSON.parse(lsitem);
      this.profiles = storeData.profiles
      this.selectedProfile = storeData.selectedProfile
      if (this.profiles.length && this.selectedProfile) {
        this.changeProfile(this.selectedProfile)
      } else {
        this.reloadConfig()
      }
      if (!storeData) {
        console.log('No data stored');
        return;
      }
    } catch (error) {
      console.error('Error loading data:', error)
      return
    }
  }

  applyConfig(config, reload) {
    this.config = config
    
    this.config.particleSize = parseInt(this.config.particleSize)
    this.config.attractionForce = parseFloat(this.config.attractionForce)
    this.config.canvasHeight = parseInt(this.config.canvasHeight)
    this.config.canvasWidth = parseInt(this.config.canvasWidth)
    this.config.collitionForce = parseFloat(this.config.collitionForce)
    this.config.gravityForce = parseFloat(this.config.gravityForce)
    this.config.particleAmmount = parseInt(this.config.particleAmmount)
    this.config.particleFriction = parseFloat(this.config.particleFriction)
    this.config.particleMass = parseFloat(this.config.particleMass)
    this.config.particleSize = parseFloat(this.config.particleSize)
    this.selectedProfile = this.config.profileName

    if (reload) {
      this.game?.reset(this.config)
    } else if (this.game) {
      this.game.config = this.config
      this.game.createParticles()
    }
  }

  reloadConfig() {
    localStorage.removeItem('partsim-config')
    this.saveConfig(INITIAL_CONFIG)
  }
}
