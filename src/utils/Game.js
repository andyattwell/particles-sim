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
    this.createParticles()
    this.addSomeBoxes()
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
      particle.update()

      self.particles.forEach((particle2, index2) => {
        if (index1 !== index2) {
          // Check collision
          particle.checkCollition(particle2)
          // Apply attraction
          particle.applyAttraction(particle2, this.config.attractionForce)
        }
      })
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

  createParticles() {

    const clipPos = this.getMaskPosition();

    if (this.particles.length <= this.config.particleAmmount) {
      for (let index = this.particles.length; index < this.config.particleAmmount; index++) {
        const position = {
          x: clipPos.x + this.getRandomNumber(this.config.containerWidth),
          y: clipPos.y + this.getRandomNumber(this.config.containerHeight)
        }
        let config = {
          ...this.config,
          position
        }
        this.particles.push(
          new Particle(this.canvas, config)
        )
      }
    } else if (this.particles.length > this.config.particleAmmount) {
      const ex = this.particles.length - this.config.particleAmmount
      this.particles.splice(0, ex)
    }

    this.particles.forEach((particle) => {
      particle.setConfig(this.config)
      if (particle.type === 'particle') {
      }
    })
  }

  addSomeBoxes() {
    const clipPos = this.getMaskPosition();
    const position = {
      x: clipPos.x + this.getRandomNumber(this.config.containerWidth),
      y: clipPos.y + this.getRandomNumber(this.config.containerHeight)
    }
    const config = {
      ...this.config,
      position, width: 80, height: 40, radius: 0
    }
    const newBox = new Box(this.canvas, config)
    this.particles.push(newBox)
  }

}