import Particle from './Particle'

export default class Game {
  canvas
  ctx
  particles = []
  config

  constructor(canvas, config) {
    this.config = config
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')

  }

  start() {
    this.createParticles()
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

    const clipWidth = this.config.canvasWidth; // Example: Width to clip
    const clipHeight = this.config.canvasHeight; // Example: Height to clip
    const clipX = this.canvas.width / 2 - this.config.canvasWidth / 2
    const clipY = this.canvas.height / 2 - this.config.canvasHeight / 2
    this.ctx.beginPath();
    this.ctx.rect(clipX, clipY, clipWidth, clipHeight);
    this.ctx.clip();
    this.ctx.lineWidth = 2; // Border width
    this.ctx.strokeStyle = 'white'; // Border color
    this.ctx.stroke();

    this.particles.forEach((particle, index1) => {
      particle.draw()
      particle.update()
      self.applyGravity(particle, this.config.gravityForce)

      self.particles.forEach((particle2, index2) => {
        if (index1 !== index2) {
          // Check collision
          const collition = particle.checkCollition(particle2)
          if (collition.isColliding) {
            particle.collideWith(particle2, collition.direction)
          } else {
            // particle2.resetColor()
          }

          // Apply attraction
          self.applyAttraction(particle, particle2, this.config.attractionForce)
        }
      })
    })
    
    // Restore the canvas state to remove clipping for future drawings
    this.ctx.restore();

    requestAnimationFrame(() => {
      self.update()
    })
  }

  createParticles() {
    function getRandomNumber(max) {
      return Math.floor(Math.random() * (max + 1))
    }

    const clipX = this.canvas.width / 2 - this.config.canvasWidth / 2
    const clipY = this.canvas.height / 2 - this.config.canvasHeight / 2

    if (this.particles.length <= this.config.particleAmmount) {
      for (let index = this.particles.length; index < this.config.particleAmmount; index++) {
        this.particles.push(
          new Particle(
            this.canvas,
            {
              x: clipX + getRandomNumber(this.config.canvasWidth),
              y: clipY + getRandomNumber(this.config.canvasHeight)
            },
            this.config
          )
        )
      }
    } else if (this.particles.length > this.config.particleAmmount) {
      const ex = this.particles.length - this.config.particleAmmount
      this.particles.splice(0, ex)
    }

    this.particles.forEach((particle) => {
      particle.config = this.config
    })
  }

  applyAttraction(obj1, obj2, attractionStrength = 0.03) {
    const dx = obj2.x - obj1.x
    const dy = obj2.y - obj1.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance > 0) {
      const forceMagnitude = attractionStrength / distance
      const forceX = (dx / distance) * forceMagnitude
      const forceY = (dy / distance) * forceMagnitude
      obj1.applyForce(0.1, { x: forceX, y: forceY })
    }
  }

  applyGravity(object, gravityStrength = 0.003) {
    const clipY = this.canvas.height / 2 - this.config.canvasHeight / 2
    const dy = clipY + this.config.canvasHeight - object.y
    if (dy > 0) {
      const forceY = dy * gravityStrength
      object.applyForce(1, { x: 0, y: forceY })
    }
  }

}