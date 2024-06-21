import Particle from './Particle'
import Box from './Box'
import { INITIAL_GAME_CONFIG } from './Settings.js'

export default class Game {
  canvas
  ctx
  particles = []
  config = INITIAL_GAME_CONFIG
  requestId = null

  constructor(canvasId, config) {
    this.canvasId = canvasId
    if (config) {
      this.config = config
    }
    this.setCanvas()
  }

  start() {
    // this.setCanvasSize()
    this.particles = []
    this.createParticles(1, 'particle')
    this.createParticles(1, 'box')
    this.play()
  }

  play() {
    if (!this.requestId) {
      this.playing = true;
      this.update()
    }
  }

  stop() {
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null
      this.playing = false;
    }
  }

  pause () {
    if (!this.requestId) {
      this.play()
    } else {
      this.stop()
    }
    return this.playing
  }

  reset(config) {
    this.config = config
    this.particles = []
    this.start()
  }

  update() {
    if (!this.ctx) {
      return
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    const self = this

    this.ctx.save();

    this.drawClippingMask();

    this.particles.forEach((particle, index1) => {
      particle.draw()
      particle.update(index1, self.particles)
    })
    
    // Restore the canvas state to remove clipping for future drawings
    this.ctx.restore();

    if (this.playing) {
      this.requestId = requestAnimationFrame(() => {
        self.update()
      })
    }
  }

  drawClippingMask() {
    const clipWidth = this.config.containerWidth; // Example: Width to clip
    const clipHeight = this.config.containerHeight; // Example: Height to clip
    const clipX = this.canvas.width / 2 - this.config.containerWidth / 2
    const clipY = this.canvas.height / 2 - this.config.containerHeight / 2
    this.ctx.beginPath();
    this.ctx.rect(clipX, clipY, clipWidth, clipHeight);
    this.ctx.clip();
    this.ctx.lineWidth = 2; // Border width
    this.ctx.strokeStyle = 'white'; // Border color
    this.ctx.stroke();
    this.ctx.closePath();
  }

  getMaskPosition() {
    const clipX = this.canvas.width / 2 - this.config.containerWidth / 2
    const clipY = this.canvas.height / 2 - this.config.containerHeight / 2
    return {
      x: clipX,
      y: clipY
    }
  }

  getRandomNumber(max) {
    return Math.floor(Math.random() * (max + 1))
  }

  addObject (type, props) {
    let obj;
    if (type === 'particle') {
      obj = new Particle(this, props);
    } else if (type === 'box') {
      obj = new Box(this, props);
    }

    if (obj) {
      this.particles.push(obj)
    }
  }

  createParticles(particleAmmount, type) {
    const clipPos = this.getMaskPosition();
    for (let index = 0; index < particleAmmount; index++) {
      const position = {
        x: clipPos.x + this.getRandomNumber(this.config.containerWidth),
        y: clipPos.y + this.getRandomNumber(this.config.containerHeight)
      }
      this.addObject(type, { position })
    }
  }

  loadParticles(particlesArr) {
    if (!particlesArr) return false;
    this.particles = []
    particlesArr.forEach(p => {
      this.addObject(p.type, {
        ...this.config,
        ...p, 
        containerHeight: parseInt(this.config.containerHeight),
        containerWidth: parseInt(this.config.containerWidth)
      })
    });
  }

  updateParticles() {
    
    if (this.config.particles) {
      this.loadParticles(this.config.particles);
    }

    this.particles.forEach((particle) => {
      particle.containerWidth = parseInt(this.config.containerWidth)
      particle.containerHeight = parseInt(this.config.containerHeight)
    })
  }

  moveParticle(particle, mouseX, mouseY) {
    
    let nextX = mouseX
    let nextY = mouseY

    const canvasHeight = parseInt(this.canvas.height)
    const canvasWidth =  parseInt(this.canvas.width)
    const containerHeight = parseInt(this.config.containerHeight)
    const containerWidth = parseInt(this.config.containerWidth)

    const clipX = (canvasWidth / 2) - (containerWidth / 2)
    const clipY = (canvasHeight / 2) - (containerHeight / 2)

    const boundWidth = clipX + containerWidth
    const boundHeight = clipY + containerHeight
    const boundingBox = particle.getBoundingBox(nextX, nextY);

    if (!particle.isCircle) { 
      nextX = boundingBox.left
      nextY = boundingBox.top
    }

    if (boundingBox.left < clipX) {
      nextX = clipX + (particle.isCircle ? particle.radius : 0)
    } else if (boundingBox.right > boundWidth) {
      nextX = boundWidth - (particle.isCircle ? particle.radius : particle.width) 
    }

    if (boundingBox.top <= clipY) {
      nextY = clipY +  (particle.isCircle ? particle.radius : 0) + 2;
    } else if (boundingBox.bottom > boundHeight) {
      nextY = boundHeight - (particle.isCircle ? particle.radius : particle.height) + 2;
    }

    particle.x = nextX
    particle.y = nextY
  }

  handleTool(tool, inBounds) {
    this.addObject(tool, {
      position: inBounds
    });
  }

  setParticleProps(newParticle) {
    const particle = this.particles.find((p) => newParticle.id === p.id)
    if(!particle) return;
    particle.setConfig(newParticle);
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

  setCanvas() {
    this.canvas = document.getElementById(this.canvasId)
    this.ctx = this.canvas?.getContext('2d')
  }

  setCanvasSize(containerWidth) {
    this.setCanvas();
    if (!this.canvas) {
      return;
    }
    const container = document.getElementById('canvas-container');

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

    this.applyConfig(this.config);
  }
  
  applyConfig(config, reload) {
    this.config = config
    this.selectedProfile = config.profileName

    if (reload) {
      this.reset(this.config)
    }
  }

  determineDirection(x1, y1, x2, y2) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    return {
      x: Math.tanh(deltaX), y: Math.tanh(deltaY)
    }
  }

}