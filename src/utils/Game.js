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
    this.createParticles(this.config.particleAmmount)
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
          // Apply attraction
          // particle.applyAttraction(particle2, this.config.attractionForce)
          // Check collision
          const collition = particle.checkCollition(particle2);
          if (collition.isColliding === true) {
            // console.log('collition')
            particle.collideWith(particle2, collition.direction)
          }
          
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

  createParticles(particleAmmount) {
    const clipPos = this.getMaskPosition();
    const particles = []
    for (let index = 0; index < particleAmmount; index++) {
      const position = {
        x: clipPos.x + this.getRandomNumber(this.config.containerWidth),
        y: clipPos.y + this.getRandomNumber(this.config.containerHeight)
      }
      let config = {
        ...this.config,
        position
      }
      particles.push(
        new Particle(this.canvas, config)
      )
    }
    this.particles = particles;
  }

  updateParticles() {
    if (this.config.particleAmmount > this.particles.length) {
      this.createParticles(this.config.particleAmmount)
    } else if (this.config.particleAmmount < this.particles.length) {
      const diff = this.particles.length - this.config.particleAmmount
      this.particles.splice(0, diff)
    }
    this.particles.forEach((particle) => {
      if (particle.type === 'particle') {
        particle.setConfig(this.config)
      }
    })
  }

  addSomeBoxes() {
    const clipPos = this.getMaskPosition();
    const newBox = new Box(this.canvas, {
      ...this.config,
      color: "#fe37f4",
      position: {
        x: 20,
        y: 20
      }, width: 80, height: 40
    })
    const newBox2 = new Box(this.canvas, {
      ...this.config,
      position: {
        x: clipPos.x + this.getRandomNumber(this.config.containerWidth),
        y: clipPos.y + this.getRandomNumber(this.config.containerHeight)
      }, width: 30, height: 30
    })
    this.particles.push(newBox)
    this.particles.push(newBox2)
  }

}