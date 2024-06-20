import Body from './Body'
export default class Particle extends Body {
  ctx
  color = '#0095DD'
  baseColor = '#0095DD'
  selected = false
  radius = 20
  isCircle = true
  type = 'particle'

  constructor(game, props) {
    super(game, props)
    this.canvas = game.canvas
    this.ctx = this.canvas.getContext('2d')
  }
  
  draw() {
    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    this.ctx.fillStyle = this.color
    this.ctx.fill()
    this.ctx.closePath()
    // super.draw()
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

  resetColor() {
    this.color = this.baseColor
  }

}