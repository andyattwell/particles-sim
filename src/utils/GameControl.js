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
    this.canvasId = canvasId
    this.canvas = document.getElementById(canvasId)
    
    // if (config) {
    //   this.config = config
    // } else {
    //   this.config = INITIAL_CONFIG
    // }

    this.game = new Game(this.canvas, this.config)
    // this.loadSavedConfig()
  }

  start() {
    setTimeout(() => {
      this.setCanvasSize();
      this.game.start();
    }, 100)
  }

  setCanvas() {
    this.canvas = document.getElementById(this.canvasId)
  }

  setCanvasSize(containerWidth) {
    // const size = this.getCanvasSize();
    this.setCanvas();
    const container = document.getElementById('canvas-container');
    // if (!container) {
    //   return
    // }
    let width = parseInt(container.clientWidth);
    let height = parseInt(container.clientHeight);

    if (containerWidth) {
      width = parseInt(containerWidth);
    }
    
    this.canvas.setAttribute('width', width)
    this.canvas.setAttribute('height', height)

    this.config.canvasMaxWidth = width;
    this.config.canvasMaxHeight = height;

    if (this.config.containerWidth > width) {
      this.config.containerWidth = parseInt(width);
    }
    if (this.config.containerHeight > height) {
      this.config.containerHeight = parseInt(height);
    }

    this.saveConfig(this.config);
  }

  getCanvasSize() {
    const windowHeight = window.innerHeight
    const windowWidth = window.innerWidth

    const panelWidth = document.querySelector('#particle-controls').clientWidth + 20

    return {
      width: windowWidth - panelWidth,
      height: windowHeight
    }
  }

  handleClick(event) {
    let inBounds = this.checkWindowBouds(event.clientX, event.clientY)
    if (!inBounds.inbound) {
      return
    }

    if (this.selectedTool) {
      this.handleTool(this.selectedTool, inBounds)
      return;
    }

    const particle = this.game.particles.find((p) => p.isClicked(inBounds))

    this.mouse.startX = inBounds.x
    this.mouse.startY = inBounds.y
    this.mouse.isMouseDown = true

    if (particle) {
      this.selectedParticle = particle;
      this.selectedParticle.select();
      return this.selectedParticle
    }

    return false;
  }

  handleMouseUp(event) {
    if (!this.mouse.isMouseDown || !this.selectedParticle) return;

    this.mouse.endX = event.clientX;
    this.mouse.endY = event.clientY;
    this.mouse.isMouseDown = false;

    
    this.selectedParticle?.deselect();
    // const direction = this.determineDirection(this.mouse.startX, this.mouse.startY, this.mouse.endX, this.mouse.endY);
    // this.selectedParticle?.applyForce(10, {
    //   x: direction.x * 2,
    //   y: direction.y * 2
    // });
    this.selectedParticle = null
  }

  handleMouseMove(event) {

    if (this.selectedTool) {
      return;
    }

    if (this.selectedParticle) {
      this.moveParticle(this.selectedParticle, event.clientX, event.clientY)
    }

    if (this.mouse.isMouseDown) {
      this.mouse.lastX = this.mouse.startX;
      this.mouse.lastY = this.mouse.startY;
    }
  }

  moveParticle(particle, mouseX, mouseY) {
    
    let nextX = mouseX
    let nextY = mouseY

    const canvasHeight = parseInt(this.game.canvas.height)
    const canvasWidth =  parseInt(this.game.canvas.width)
    const containerHeight = parseInt(this.game.config.containerHeight)
    const containerWidth = parseInt(this.game.config.containerWidth)

    const clipX = (canvasWidth / 2) - (containerWidth / 2)
    const clipY = (canvasHeight / 2) - (containerHeight / 2)

    const boundWidth = clipX + containerWidth
    const boundHeight = clipY + containerHeight
    const boundingBox = particle.getBoundingBox(nextX, nextY);

    if (boundingBox.left < clipX) {
      nextX = clipX + (particle.isCircle ? particle.radius : particle.width)
    } else if (boundingBox.right > boundWidth) {
      nextX = boundWidth - (particle.isCircle ? particle.radius : particle.width) 
    }

    if (boundingBox.top <= clipY) {
      nextY = clipY +  (particle.isCircle ? particle.radius : particle.height) + 2;
    } else if (boundingBox.bottom > boundHeight) {
      nextY = boundHeight - (particle.isCircle ? particle.radius : particle.height) + 2;
    }

    particle.x = nextX
    particle.y = nextY
  }

  handleTool(tool, inBounds) {
    this.game.addObject(tool, {
      position: inBounds
    });
  }

  determineDirection(x1, y1, x2, y2) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    return {
      x: Math.tanh(deltaX), y: Math.tanh(deltaY)
    }
  }

  checkWindowBouds(pageX, pageY, particle) {
    const windowHeight = this.canvas.height
    const windowWidth = this.canvas.width

    let boundingBox = {
      left: pageX,
      right: pageX,
      top: pageY,
      bottom: pageY
    }

    if (particle) {
      console.log({particle})
      boundingBox = particle.getBoundingBox()
    }

    let canvasLeft = windowWidth / 2 - parseInt(this.config.containerWidth) / 2
    let canvasRight = canvasLeft + parseInt(this.config.containerWidth)
    let canvasTop = windowHeight / 2 - parseInt(this.config.containerHeight) / 2
    let canvasBottom = canvasTop + parseInt(this.config.containerHeight)
    const canvasPosition = this.canvas.getBoundingClientRect()

    let inbound = true
    if (
      boundingBox.left < canvasLeft || 
      boundingBox.right > canvasRight || 
      boundingBox.top < canvasTop || 
      boundingBox.bottom > canvasBottom
    ) {
      inbound = false
    }

    let x = pageX - canvasPosition.left;
    let y = pageY - canvasPosition.top;

    return { inbound, x, y }
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
    this.applyConfig(config)
    // this.updateConfigProfile(config)
  }

  changeProfile (profileName) {
    let config = this.profiles.find((p) => p.profileName == profileName);
    if (!config) {
      config = this.profiles[0]
    }
    this.selectedProfile = config
    this.updateConfigProfile(config)
    this.applyConfig(config, true)
  }

  updateConfigProfile(config) {
    if (!config.profileName || config.profileName === '') {
      return false;
    }

    let found = false;
    this.profiles = this.profiles.map((p) => {
      if (p.profileName === config.profileName) {
        found = true
        if (this.game && this.game.particles.length) {
          p.particles = this.game.particles.map((p) => {
            p.containerHeight = parseInt(this.config.containerHeight)
            p.containerWidth = parseInt(this.config.containerHeight)
            return p
          })
        }
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
      if (!storeData?.profiles) return false;
      
      this.profiles = storeData?.profiles
      if (this.profiles.length && storeData.selectedProfile) {
        this.changeProfile(storeData.selectedProfile)
      } else {
        this.reloadConfig()
      }
      if (!storeData) {
        return;
      }
    } catch (error) {
      console.error('Error loading data:', error)
      return
    }
  }

  applyConfig(config, reload) {
    this.config = config
    this.selectedProfile = config.profileName

    if (reload) {
      this.game?.reset(this.config)
    } else if (this.game) {
      this.game.config = config
      // this.game.loadParticles(config.particles)
    }
  }

  reloadConfig() {
    localStorage.removeItem('partsim-config')
    this.saveConfig(INITIAL_CONFIG)
  }

  setParticleProps(newParticle) {
    const particle = this.game.particles.find((p) => newParticle.id === p.id)
    if(!particle) return;
    particle.setConfig(newParticle);
  }
}
