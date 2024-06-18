export default class Body {
  x = 0
  y = 0

  dy = 2 // ?

  velocityX = 0
  velocityY = 0
  radius = 0
  width = null
  height = null
  containerWidth = 0
  containerHeight = 0
  friction = 0
  mass = 0
  collitionForce = 0
  attractionForce = 0.03
  gravityForce = 0.003

  constructor(props) {
    // console.log(props)
    this.x = props.position.x
    this.y = props.position.y

    if (props.radius && props.radius > 0) {
      this.radius = props.radius
      this.isCircle = true
    }
    this.width = props.width
    this.height = props.height
    this.containerWidth = props.containerWidth
    this.containerHeight = props.containerHeight
    this.friction = props.particleFriction
    this.mass = props.particleMass
    this.collitionForce = props.collitionForce
    this.attractionForce = props.attractionForce
    this.gravityForce = props.gravityForce
  }

  update() {
    if (this.selected) {
      return
    }

    this.applyGravity()

    let halfSizeX = 0
    let halfSizeY = 0
    if (this.isCircle) {
      halfSizeX = this.radius / 2
      halfSizeY = halfSizeX
    } else {
      this.halfSizeX = this.width / 2
      this.halfSizeY = this.height / 2
    }
    const nextX = this.x + this.velocityX
    const nextY = this.y + this.velocityY

    // Check X bounds
    const clipX = this.canvas.width / 2 - this.containerWidth / 2
    const clipY = this.canvas.height / 2 - this.containerHeight / 2

    const boundWidth = clipX + this.containerWidth
    const boundHeight = clipY + this.containerHeight
    if (nextX - halfSizeX < clipX || nextX + halfSizeX > boundWidth) {
      this.velocityX *= -1
      // Adjust position to be within bounds after reversing velocity
      if (nextX - halfSizeX < clipX) {
        this.x = clipX + halfSizeX
      } else if (nextX + halfSizeX > boundWidth) {
        this.x = boundWidth - halfSizeX * 2
      }
    } else {
      this.x = nextX
    }

    // Check Y bounds
    if (nextY - halfSizeY < clipY || nextY + halfSizeY > boundHeight) {
      this.velocityY *= -1
      // Adjust position to be within bounds after reversing velocity
      if (nextY - halfSizeY < clipY) {
        this.y = clipY + halfSizeY
      } else if (nextY + halfSizeY > boundHeight) {
        this.y = boundHeight - halfSizeY * 2
      }
    } else {
      this.y = nextY
    }

    // console.log(this.velocityX, this. velocityY)

    // Apply friction to gradually slow down the object
    this.velocityX *= this.friction
    this.velocityY *= this.friction

    // If the velocity is very small, stop the object
    if (Math.abs(this.velocityX) < 0.01) this.velocityX = 0
    if (Math.abs(this.velocityY) < 0.01) this.velocityY = 0
  }

  applyForce(forceMagnitude, direction) {
    // Apply force based on the direction vector
    this.velocityX += (forceMagnitude * direction.x) / this.mass
    this.velocityY += (forceMagnitude * direction.y) / this.mass
  }

  applyAttraction(obj2) {
    const dx = obj2.x - this.x
    const dy = obj2.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance > 0) {
      const forceMagnitude = obj2.attractionForce / distance
      const forceX = (dx / distance) * forceMagnitude
      const forceY = (dy / distance) * forceMagnitude
      this.applyForce(0.1, { x: forceX, y: forceY })
    }
  }

  applyGravity() {
    const clipY = this.canvas.height / 2 - this.containerHeight / 2
    const dy = clipY + this.containerHeight - this.y
    if (dy > 0) {
      const forceY = dy * this.gravityForce
      this.applyForce(1, { x: 0, y: forceY })
    }
  }

  setConfig(config) {
    this.radius = config.radius
    this.width = config.width
    this.height = config.height
    this.containerWidth = config.containerWidth
    this.containerHeight = config.containerHeight
    this.friction = config.particleFriction
    this.mass = config.particleMass
    this.collitionForce = config.collitionForce
    this.attractionForce = config.attractionForce
    this.gravityForce = config.gravityForce
  }

  checkCollition(target) {
    let isColliding = false
    let dx = 0
    let dy = 0
    let distance = 0

    if (this.radius !== undefined && target.radius !== undefined) {
      // Circle vs Circle
      dx = this.x - target.x
      dy = this.y - target.y
      distance = Math.sqrt(dx * dx + dy * dy)
      const combinedRadius = this.radius + target.radius
      isColliding = distance <= combinedRadius
    } else if (
      this.width !== undefined &&
      this.height !== undefined &&
      target.width !== undefined &&
      target.height !== undefined
    ) {
      // Rectangle vs Rectangle
      const halfWidth1 = this.width / 2
      const halfHeight1 = this.height / 2
      const halfWidth2 = target.width / 2
      const halfHeight2 = target.height / 2

      const centerX1 = this.x + halfWidth1
      const centerY1 = this.y + halfHeight1
      const centerX2 = target.x + halfWidth2
      const centerY2 = target.y + halfHeight2

      dx = Math.abs(centerX1 - centerX2)
      dy = Math.abs(centerY1 - centerY2)
      const combinedHalfWidth = halfWidth1 + halfWidth2
      const combinedHalfHeight = halfHeight1 + halfHeight2
      isColliding = dx <= combinedHalfWidth && dy <= combinedHalfHeight
    } else if (
      this.radius !== undefined &&
      target.width !== undefined &&
      target.height !== undefined
    ) {
      // Circle vs Rectangle
      const halfWidth = target.width / 2
      const halfHeight = target.height / 2
      const centerX = target.x + halfWidth
      const centerY = target.y + halfHeight

      dx = Math.abs(this.x - centerX)
      dy = Math.abs(this.y - centerY)

      if (dx > halfWidth + this.radius || dy > halfHeight + this.radius) {
        isColliding = false
      } else if (dx <= halfWidth || dy <= halfHeight) {
        isColliding = true
      } else {
        const cornerDistanceSq = (dx - halfWidth) ** 2 + (dy - halfHeight) ** 2
        isColliding = cornerDistanceSq <= this.radius ** 2
      }
      distance = Math.sqrt((this.x - centerX) ** 2 + (this.y - centerY) ** 2)
    } else if (
      this.width !== undefined &&
      this.height !== undefined &&
      target.radius !== undefined
    ) {
      // Rectangle vs Circle (reversed)
      const halfWidth = this.width / 2
      const halfHeight = this.height / 2
      const centerX = this.x + halfWidth
      const centerY = this.y + halfHeight

      dx = Math.abs(target.x - centerX)
      dy = Math.abs(target.y - centerY)

      if (dx > halfWidth + target.radius || dy > halfHeight + target.radius) {
        isColliding = false
      } else if (dx <= halfWidth || dy <= halfHeight) {
        isColliding = true
      } else {
        const cornerDistanceSq = (dx - halfWidth) ** 2 + (dy - halfHeight) ** 2
        isColliding = cornerDistanceSq <= target.radius ** 2
      }
      distance = Math.sqrt((target.x - centerX) ** 2 + (target.y - centerY) ** 2)
    } else {
      throw new Error('Objects must have either radius or width and height properties defined.')
    }

    if (distance === 0) {
      distance = 1 // Avoid division by zero for the direction calculation
    }

    const direction = isColliding ? { x: dx / distance, y: dy / distance } : null

    if (isColliding) {
      this.collideWith(target, direction)
    }

    return {
      isColliding,
      direction
    }
  }

  collideWith(target, direction) {
    // this.color = "#9500DD";
    let force = this.collitionForce
    if (this.selected) {
      force *= 5
    }

    target.applyForce(force, {
      x: direction.x * -1,
      y: direction.y * -1
    })

    if (!this.selected) {
      this.applyForce(this.collitionForce, direction)
    } else {
      target.color = '#ffffff'
      setTimeout(() => {
        target.color = target.baseColor
      }, 1000)
    }
  }

  move(x, y) {
    let width = 0;
    let height = 0;
    if (this.radius == 0) {
      width = this.width;
      height = this.height;
    }
    this.x = x - width / 2
    this.y = y - height / 2
  }

  getBoundingbox() {
    let left = 0
    let right = 0
    let top = 0
    let bottom = 0

    if (this.radius > 0) {
      left = this.x - this.radius / 2
      right = left + this.radius
      top = this.y - this.radius / 2
      bottom = top + this.radius
    } else {
      left = this.x
      right = left + this.width
      top = this.y
      bottom = top + this.height
    }

    return {
      left: Math.floor(left),
      right: Math.floor(right),
      top: Math.floor(top),
      bottom: Math.floor(bottom)
    }
  }

  isClicked(inBounds) {
    let boundingBox = this.getBoundingbox()

    if (
      inBounds.x >= boundingBox.left &&
      inBounds.x <= boundingBox.right &&
      inBounds.y >= boundingBox.top &&
      inBounds.y <= boundingBox.bottom
    ) {
      // particle.select()
      return true
    } else {
      // particle.deselect()
      return false
    }
  }
}
