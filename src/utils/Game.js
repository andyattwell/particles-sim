import Particle from './Particle'
import Box from './Box'

export default class Game {
  canvas
  ctx
  particles = []
  boxes = []
  config

  constructor(canvas, config) {
    this.config = config
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  start() {
    this.createParticles(1, 'particle')
    this.createParticles(1, 'box')
    this.update()
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

    this.boxes.forEach(box => {
      box.draw()
    })
    
    // Restore the canvas state to remove clipping for future drawings
    this.ctx.restore();

    requestAnimationFrame(() => {
      self.update()
    })
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

}