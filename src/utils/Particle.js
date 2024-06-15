export default class Particle {
  x = 0
  y = 0
  dy = 2
  ctx
  color = '#0095DD'
  baseColor = '#0095DD'
  selected = false
  velocityX = 0
  velocityY = 0

  constructor(canvas, position, config) {
    this.config = config
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.x = 0
    this.y = 0
    if (position) {
      this.x = position.x
      this.y = position.y
    }
  }

  draw() {
    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, this.config.particleSize, 0, Math.PI * 2)

    let color = this.color;
    // if (this.velocityX <= -0.09) {
    //   color = "#2a58ff"
    // } else if (this.velocityX >= -0.1) {
    //   color = "#fa5d18"
    // } else if (this.velocityX >= 0) {
    //   color = "#ffffff"
    // } else if (this.velocityX >= 0.01) {
    //   color = "#4f75fd"
    // } else if (this.velocityX > 0.1) {
    //   color = "#2a58ff"
    // }
    this.ctx.fillStyle = color
    this.ctx.fill()
    this.ctx.closePath()
  }

  update() {
    if (this.selected) {
      return
    }

    const halfSize = this.config.particleSize / 2
    const nextX = this.x + this.velocityX
    const nextY = this.y + this.velocityY

    // Check X bounds
    const clipX = this.canvas.width / 2 - this.config.canvasWidth / 2
    const clipY = this.canvas.height / 2 - this.config.canvasHeight / 2
    
    const boundWidth = clipX + this.config.canvasWidth
    const boundHeight = clipY + this.config.canvasHeight

    if (nextX - halfSize < clipX || nextX + halfSize > boundWidth) {
      this.velocityX *= -1
      // Adjust position to be within bounds after reversing velocity
      if (nextX - halfSize < clipX) {
        this.x = clipX + halfSize
      } else if (nextX + halfSize > boundWidth) {
        this.x = boundWidth - this.config.particleSize
      }
    } else {
      this.x = nextX
    }

    // Check Y bounds
    if (nextY - halfSize < clipY || nextY + halfSize > boundHeight) {
      this.velocityY *= -1
      // Adjust position to be within bounds after reversing velocity
      if (nextY - halfSize < clipY  ) {
        this.y = clipY + halfSize
      } else if (nextY + halfSize > boundHeight) {
        this.y = boundHeight - this.config.particleSize
      }
    } else {
      this.y = nextY
    }

    // console.log(this.velocityX, this. velocityY)

    // Apply friction to gradually slow down the object
    this.velocityX *= this.config.particleFriction
    this.velocityY *= this.config.particleFriction

    // If the velocity is very small, stop the object
    if (Math.abs(this.velocityX) < 0.01) this.velocityX = 0
    if (Math.abs(this.velocityY) < 0.01) this.velocityY = 0
  }

  applyForce(forceMagnitude, direction) {
    // Apply force based on the direction vector
    this.velocityX += (forceMagnitude * direction.x) / this.config.particleMass
    this.velocityY += (forceMagnitude * direction.y) / this.config.particleMass
  }

  checkCollition(target) {
    // Calculate the distance between the centers of the two objects
    const dx = this.x - target.x
    const dy = this.y - target.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Calculate the combined radius of the two objects
    const combinedRadius = this.config.particleSize + target.config.particleSize

    // If the distance is less than or equal to the combined radius, a collision has occurred
    const isColliding = distance <= combinedRadius

    // Normalize the direction vector
    const direction = {
      x: dx / distance,
      y: dy / distance
    }

    return {
      isColliding,
      direction: isColliding ? direction : null
    }
  }

  select() {
    this.selected = true
    this.color = '#f5ff08'
    this.velocityX = 0
    this.velocityY = 0
  }

  deselect() {
    
    setTimeout(() => {
      this.resetColor()
    }, 1000);
    this.selected = false
    this.velocityX = 0
    this.velocityY = 0
  }

  collideWith(target, direction) {
    // this.color = "#9500DD";
    let force = this.config.collitionForce;
    if (this.selected) {
      force *= 5
    }

    target.applyForce(force, {
      x: direction.x * -1,
      y: direction.y * -1
    })

    if (!this.selected) {
      this.applyForce(this.config.collitionForce, direction)
    } else {
      target.color = "#ffffff"
      setTimeout(() => {
        target.color = target.baseColor
      }, 1000);
    }
  }

  resetColor() {
    this.color = this.baseColor
  }

  move(x, y) {
    this.x = x
    this.y = y
  }

  getBoundingbox() {
    const left = this.x - this.config.particleSize / 2
    const right = left + this.config.particleSize
    const top = this.y - this.config.particleSize / 2
    const bottom = top + this.config.particleSize

    return {
      left,
      right,
      top,
      bottom
    }
  }

  isClicked(inBounds) {
    const particleLeft = Math.floor(this.x - this.config.particleSize / 2)
    const particleRight = Math.floor(particleLeft + this.config.particleSize)
    const particleTop = Math.floor(this.y - this.config.particleSize / 2)
    const particleBottom = Math.floor(particleTop + this.config.particleSize)
    if (
      inBounds.x >= particleLeft &&
      inBounds.x <= particleRight &&
      inBounds.y >= particleTop &&
      inBounds.y <= particleBottom
    ) {
      // particle.select()
      return true;
    } else {
      // particle.deselect()
      return false;
    }
  }
}