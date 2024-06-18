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
    this.addSomeBoxes()
    this.createParticles(this.config.particleAmmount)
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

  addObject (type, position) {
    const config = {
      ...this.config,
      position
    }
    let obj;
    if (type === 'particle') {
      obj = new Particle(this.canvas, config);
    } else if (type === 'box') {
      obj = new Box(this.canvas, config);
    }

    if (obj) {
      this.particles.push(obj)
    }
  }

  createParticles(particleAmmount) {
    const clipPos = this.getMaskPosition();
    for (let index = 0; index < particleAmmount; index++) {
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
  }

  updateParticles() {
    
    if (this.config.particleAmmount > this.particles.length) {
      this.createParticles(this.config.particleAmmount)
    } else if (this.config.particleAmmount < this.particles.length) {
      const diff = this.particles.length - this.config.particleAmmount
      this.particles.splice(this.particles.length - diff, diff)
    }

    this.particles.forEach((particle) => {
      if (particle.type === 'particle') {
        particle.setConfig(this.config)
      } else {
        particle.containerWidth = this.config.containerWidth
        particle.containerHeight = this.config.containerHeight
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