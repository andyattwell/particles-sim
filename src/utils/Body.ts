import type { ParticleProps, Position } from "@/types"
import type Game from "./Game"

export default class Body {
  game: Game
  canvas: any
  ctx: any
  type:string = ''
  id?:number
  x = 0
  y = 0
  velocityX = 0
  velocityY = 0
  radius = 0
  width = 0
  height = 0
  containerWidth:number|undefined = 0
  containerHeight:number|undefined = 0
  friction = 0.95
  mass = 1
  collitionForce = 1
  attractionForce = 0.5
  gravityForce = 0.05
  isCircle = false
  grounded = false
  isDragging = false
  selected = false
  baseColor = "#ffffff"
  color = "#ffffff"
  collitionColor = "#f62626"

  constructor(game:Game, props:ParticleProps|null = null) {
    this.game = game
    this.canvas = game.canvas
    this.ctx = this.canvas.getContext('2d')
    if (props) {
      this.setConfig(props)
    }
  }

  setConfig(props: ParticleProps) {
    
    this.containerWidth = Number(this.game.config.containerWidth)
    this.containerHeight = Number(this.game.config.containerWidth)

    if (props.position) {
      this.x = props.position.x
      this.y = props.position.y
    } else {
      if (props.x) {
        this.x = props.x
      }
      if (props.y) {
        this.y = props.y
      }
    }
    if (props.radius) {
      this.radius = Number(props.radius)
      this.height = Number(props.radius)
      this.width = Number(props.radius)
      this.isCircle = true
    }
    if (props.width) {
      this.width = Number(props.width)
    }
    if (props.height) {
      this.height = Number(props.height)
    }
    if (props.friction) {
      this.friction = Number(props.friction)
    }
    if (props.mass) {
      this.mass = Number(props.mass)
    }
    if (props.collitionForce) {
      this.collitionForce = Number(props.collitionForce)
    }
    if (props.attractionForce) {
      this.attractionForce = Number(props.attractionForce)
    }
    if (props.gravityForce) {
      this.gravityForce = Number(props.gravityForce)
    }
    if (props.color) {
      this.baseColor = props.color
      this.color = props.color
    }
    if (!this.id) {
      this.id = Math.floor(Math.random() * 10000)
    }
  }

  draw() {
    const boundingBox = this.getBoundingBox()
    this.ctx.beginPath();
    this.ctx.rect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height);
    this.ctx.lineWidth = 2; // Border width
    this.ctx.strokeStyle = '#FFFFFF'; // Border color
    this.ctx.stroke();
    this.ctx.closePath();
  }

  update(index:number, objects:Array<Body>) {
    
    objects.forEach((particle2, index2) => {
      if (index !== index2) {
        // Apply attraction
        // Check collision
        const collition = this.checkCollition(particle2);
        if (collition.isColliding === true) {
          this.collideWith(particle2, {
            x: collition.direction.x * -1,
            y: collition.direction.y * -1,
          })
        }

        this.applyAttraction(particle2)
      }
    })

    if (this.isDragging) {
      this.velocityX = 0
      this.velocityY = 0
      return
    }

    this.applyGravity()

    this.checkBouds()

    // Apply friction to gradually slow down the object
    this.x += this.velocityX
    this.y += this.velocityY

    this.velocityX *= this.friction
    this.velocityY *= this.friction

    // If the velocity is very small, stop the object
    if (Math.abs(this.velocityX) < 0.01) this.velocityX = 0
    if (Math.abs(this.velocityY) < 0.01) this.velocityY = 0
  }

  checkBouds() {
    if (this.velocityX == 0 && this.velocityY == 0) return

    let nextX = this.x
    let nextY = this.y
    // Check X bounds
    const canvasHeight = parseInt(this.game.canvas.height)
    const canvasWidth =  parseInt(this.game.canvas.width)
    const containerHeight = this.game.config.containerHeight || 1
    const containerWidth = this.game.config.containerWidth || 1

    const clipX = (canvasWidth / 2) - (containerWidth / 2)
    const clipY = (canvasHeight / 2) - (containerHeight / 2)

    const boundWidth = clipX + containerWidth
    const boundHeight = clipY + containerHeight
    
    const boundingBox = this.getBoundingBox(nextX, nextY);

    // Check bounds
    if (boundingBox.left <= clipX || boundingBox.right >= boundWidth) {
      this.velocityX *= -1
      if (boundingBox.left < clipX) {
        nextX = clipX + (this.isCircle ? this.radius : this.width)
      } else if (boundingBox.right > boundWidth) {
        nextX = boundWidth - (this.isCircle ? this.radius : this.width) 
      }
    }

    if (boundingBox.top <= clipY || boundingBox.bottom >= boundHeight) {
      // Adjust position to be within bounds after reversing velocity
      this.velocityY *= -1
      if (boundingBox.top < clipY) {
        nextY = clipY + (this.isCircle ? this.radius : 1);
      } else if (boundingBox.bottom > boundHeight) {
        nextY = boundHeight - (this.isCircle ? this.radius : this.height);
      }
      
    }
    this.x = nextX
    this.y = nextY
  }

  applyForce(forceMagnitude:number, direction: Position) {
    // Apply force based on the direction vector
    if (!direction || (direction.x === 0 && direction.y === 0)) {
      return;
    }

    this.velocityX += (forceMagnitude * direction.x) / this.mass
    this.velocityY += (forceMagnitude * direction.y) / this.mass
  }

  applyAttraction(obj2:Body) {
    if (this.attractionForce === 0) {
      return
    }
    const dx = this.x - (obj2.x || 0) 
    const dy = this.y - (obj2.y || 0)
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance > 0) {
      const forceMagnitude = this.attractionForce / distance
      const forceX = (dx / distance) * forceMagnitude
      const forceY = (dy / distance) * forceMagnitude
      obj2.applyForce(0.1, { x: forceX, y: forceY })
    }
  }

  applyGravity() {
    const canvasHeight = parseInt(this.game.canvas.height)
    const containerHeight = this.game.config.containerHeight || 1
    const clipY = (canvasHeight / 2) - (containerHeight / 2)

    const dy = clipY + containerHeight - this.y
    if (dy > 0) {
      this.applyForce(this.gravityForce, { x: 0, y: 1 })
    }
  }

  getBoundingBox(tmpX: number|null = null, tmpY:number|null = null) {
    let left, right, top, bottom;
    let width = this.width
    let height = this.height

    let x = this.x
    let y = this.y
    if (tmpX && tmpY) {
      x = tmpX
      y = tmpY
    }

    if (this.isCircle ) {
      width = this.radius * 2
      height = this.radius * 2
      left = x - this.radius;
      right = left + width;
      top = y - this.radius;
      bottom = top + height;
    } else {
      left = x;
      right = left + width;
      top = y;
      bottom = top + height;
    }

    return {
      left: Math.floor(left),
      right: Math.floor(right),
      top: Math.floor(top),
      bottom: Math.floor(bottom),
      width: Math.floor(width),
      height: Math.floor(height)
    };
  }

  getDirectionTo(target:Body) {
    let dx, dy;

    if (this.radius > 0 || target.radius) {
      // For circular objects
      dx = (target.x || 0) - this.x;
      dy = (target.y || 0) - this.y;
    } else {
      // For rectangular objects, compute center points
      const centerX1 = this.x + this.width / 2;
      const centerY1 = this.y + this.height / 2;
      const centerX2 = (target.x || 0) + (target.width || 0) / 2;
      const centerY2 = (target.y || 0) + (target.height || 0) / 2;

      dx = centerX2 - centerX1;
      dy = centerY2 - centerY1;
    }

    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize the direction vector
    const direction = { x: (dx / distance) * -1, y: (dy / distance) * -1 };

    return { direction, distance };
  }

  checkCollition(target:Body) {
    let isColliding = false
    let dx = 0
    let dy = 0
    let distance = 0

    if (this.isCircle && target.isCircle) {
      // Circle vs Circle
      dx = this.x - target.x
      dy = this.y - target.y
      distance = Math.sqrt(dx * dx + dy * dy)
      const combinedRadius = this.radius + target.radius
      isColliding = distance <= combinedRadius
    } else if (!this.isCircle && !target.isCircle) {
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

    } else if (this.isCircle && !target.isCircle) {
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
    } else if (!this.isCircle && target.isCircle) {
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

    // const direction = isColliding ? { x: dx / distance, y: dy / distance } : null
    const { direction } = this.getDirectionTo(target);
    return {
      isColliding,
      direction
    }
  }

  collideWith(target:Body, direction:Position) {
    // this.color = "#9500DD";
    if (!target) {
      return false;
    }

    if (this.collitionForce > 0) {
      target.applyForce(this.collitionForce, direction)
      if (!this.isDragging && target.collitionForce) {
        this.applyForce(target.collitionForce, {
          x: direction.x * -1,
          y: direction.y * -1,
        })
        if (!this.selected && (this.color !== this.collitionColor)) {
          this.setColor(this.collitionColor)
          setTimeout(() => {
            this.setColor(this.baseColor)
          }, 1000)
        }
      }
    }

  }

  setColor (color:string){
    if (!this.selected) {
      this.color = color
    }
  }

  isClicked(inBounds:Position) {
    const boundingBox = this.getBoundingBox()
    return (inBounds.x >= boundingBox.left &&
      inBounds.x <= boundingBox.right &&
      inBounds.y >= boundingBox.top &&
      inBounds.y <= boundingBox.bottom)
  }

  deselect() {
    this.color = this.baseColor
    this.isDragging = false
    this.selected = false
    this.velocityX = 0
    this.velocityY = 0
  }

  select() {
      this.selected = true
      this.color = '#f5ff08'
      this.velocityX = 0
      this.velocityY = 0
  }

}